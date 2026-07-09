// export interface ProWorkflowConfig {
//   apiKey: string;
//   email: string;
//   password?: string;
// }

// export const getStoredConfig = (): ProWorkflowConfig | null => {
//   const apiKey = localStorage.getItem("pw_api_key");
//   const email = localStorage.getItem("pw_email");
//   const pw = localStorage.getItem("pw_password") || "";

//   if (apiKey && email) {
//     return { apiKey, email, password: pw };
//   }
//   return null;
// };

// export const saveConfig = (config: ProWorkflowConfig) => {
//   localStorage.setItem("pw_api_key", config.apiKey);
//   localStorage.setItem("pw_email", config.email);
//   if (config.password) {
//     localStorage.setItem("pw_password", config.password);
//   }
// };

// export const clearConfig = () => {
//   localStorage.removeItem("pw_api_key");
//   localStorage.removeItem("pw_email");
//   localStorage.removeItem("pw_password");
// };

// export const makeProWorkflowRequest = async (endpoint: string, method: string = "GET", body?: any) => {
//   const config = getStoredConfig();
//   if (!config) throw new Error("Configuration not found");

//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//     "apikey": config.apiKey,
//   };

//   if (config.password) {
//     const credentials = btoa(`${config.email}:${config.password}`);
//     headers["Authorization"] = `Basic ${credentials}`;
//   }

//   const targetUrl = `https://api.proworkflow.net${endpoint}`;
//   const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

//   const response = await fetch(proxyUrl, {
//     method,
//     headers,
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   if (!response.ok) {
//     throw new Error(`API Error: ${response.statusText}`);
//   }

//   return await response.json();
// };

// export const testConnection = async (config: ProWorkflowConfig): Promise<boolean> => {
//   const headers: HeadersInit = {
//     "apikey": config.apiKey,
//   };

//   if (config.password) {
//     const credentials = btoa(`${config.email}:${config.password}`);
//     headers["Authorization"] = `Basic ${credentials}`;
//   }

//   try {
//     const targetUrl = "https://api.proworkflow.net/contacts";
//     const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;

//     const response = await fetch(proxyUrl, {
//       method: "GET",
//       headers,
//     });
//     return response.ok;
//   } catch {
//     return false;
//   }
// };

// export const getProjects = async () => {
//   return await makeProWorkflowRequest("/projects?status=active");
// };

// export const getTaskGroups = async (projectId: string) => {
//   return await makeProWorkflowRequest(`/projects/${projectId}/taskgroups`);
// };

// export const getStaff = async () => {
//   return await makeProWorkflowRequest("/contacts/staff");
// };


/**
 * ProWorkflow API integration.
 *
 * IMPORTANT SECURITY NOTE:
 * This module expects API_BASE_URL to point at YOUR OWN backend/proxy
 * (e.g. a small Node.js server or Azure Function) that:
 *   - forwards requests to https://api.proworkflow.net
 *   - can hold long-lived credentials server-side if needed
 *   - is infrastructure you control and can audit
 *
 * Do NOT point this at a public third-party CORS proxy (e.g. corsproxy.io)
 * in a client project. Doing so sends API keys, credentials, and — in this
 * add-in's case — email content and attachments through infrastructure you
 * do not control and cannot audit.
 *
 * Until the backend proxy exists, set VITE_PROWORKFLOW_PROXY_URL to a local
 * dev server (e.g. http://localhost:3001/api/proworkflow) that you run yourself.
 */

export interface ProWorkflowConfig {
  apiKey: string;
  email: string;
}

/** Shape of the payload sent when creating a task, matching the required workflow:
 * name, project, assignee, description, priority, and (handled separately) attachments.
 */
export interface TaskPayload {
  name: string;
  description?: string;
  contactid?: string; // assignee id
  priorityid?: number;
  duedate?: string;
  taskgroupid?: string;
}

const STORAGE_KEYS = {
  apiKey: "pw_api_key",
  email: "pw_email",
} as const;

// Password is intentionally kept in memory only for the current session.
// It is never written to localStorage, so it cannot leak via storage
// inspection or persist across sessions/devices.
let sessionPassword: string | null = null;

const API_BASE_URL =
  (import.meta as any).env?.VITE_PROWORKFLOW_PROXY_URL || "http://localhost:3001/api/proworkflow";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export class ProWorkflowApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ProWorkflowApiError";
    this.status = status;
    this.body = body;
  }
}

export const getStoredConfig = (): ProWorkflowConfig | null => {
  const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey);
  const email = localStorage.getItem(STORAGE_KEYS.email);

  if (apiKey && email) {
    return { apiKey, email };
  }
  return null;
};

/**
 * Persists the non-sensitive parts of the config (apiKey, email).
 * The password, if provided, is kept only in memory for this session.
 */
export const saveConfig = (config: ProWorkflowConfig, password?: string): void => {
  const apiKey = config.apiKey?.trim();
  const email = config.email?.trim();

  if (!apiKey) {
    throw new Error("API key is required.");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error("A valid email address is required.");
  }

  localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
  localStorage.setItem(STORAGE_KEYS.email, email);

  if (password) {
    sessionPassword = password;
  }
};

export const clearConfig = (): void => {
  localStorage.removeItem(STORAGE_KEYS.apiKey);
  localStorage.removeItem(STORAGE_KEYS.email);
  sessionPassword = null;
};

export const hasActiveSessionPassword = (): boolean => sessionPassword !== null;

const buildAuthHeaders = (config: ProWorkflowConfig): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: config.apiKey,
  };

  if (sessionPassword) {
    const credentials = btoa(`${config.email}:${sessionPassword}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return headers;
};

export const makeProWorkflowRequest = async <T = unknown>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> => {
  const config = getStoredConfig();
  if (!config) {
    throw new Error("Configuration not found. Please connect your ProWorkflow account first.");
  }

  const headers = buildAuthHeaders(config);
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let responseBody: unknown = null;
  try {
    responseBody = await response.json();
  } catch {
    // No JSON body (e.g. empty 204 response) — safe to ignore.
  }

  if (!response.ok) {
    throw new ProWorkflowApiError(
      `ProWorkflow API error (${response.status}): ${response.statusText}`,
      response.status,
      responseBody
    );
  }

  return responseBody as T;
};

/**
 * Tests a connection using credentials supplied directly (e.g. from a login form),
 * without requiring them to be saved first.
 */
export const testConnection = async (config: ProWorkflowConfig, password?: string): Promise<boolean> => {
  const headers: Record<string, string> = {
    apikey: config.apiKey,
  };

  if (password) {
    const credentials = btoa(`${config.email}:${password}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "GET",
      headers,
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getProjects = () => makeProWorkflowRequest("/projects?status=active");

export const getTaskGroups = (projectId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/taskgroups`);

export const getStaff = () => makeProWorkflowRequest("/contacts/staff");

export const createTask = <T = { id: string }>(projectId: string, taskData: TaskPayload) =>
  makeProWorkflowRequest<T>(`/projects/${projectId}/tasks`, "POST", taskData);

/**
 * Lists tasks within a task list (task group).
 * NOTE: confirm this endpoint shape against the ProWorkflow API docs.
 */
export const getTasksForTaskGroup = (projectId: string, taskGroupId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/taskgroups/${taskGroupId}/tasks`);

/**
 * Fetches full details for a single task, used to pre-fill the Edit Task form.
 * NOTE: confirm this endpoint shape against the ProWorkflow API docs.
 */
export const getTaskDetails = (projectId: string, taskId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`);

/**
 * Updates an existing task.
 * NOTE: confirm the HTTP method (PUT vs PATCH) and endpoint shape against the
 * ProWorkflow API docs.
 */
export const updateTask = (projectId: string, taskId: string, taskData: Partial<TaskPayload>) =>
  makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`, "PUT", taskData);

/** Payload for attaching a file to an already-created task. */
export interface TaskAttachmentPayload {
  name: string;
  contentType: string;
  /** Base64-encoded file content */
  contentBytes: string;
}

/**
 * Uploads a single file to an existing task.
 * NOTE: confirm the exact endpoint path and field names against the
 * ProWorkflow API docs (https://api.proworkflow.net/?documentation) —
 * this assumes a conventional /tasks/{id}/files endpoint.
 */
export const uploadTaskAttachment = (taskId: string, attachment: TaskAttachmentPayload) =>
  makeProWorkflowRequest(`/tasks/${taskId}/files`, "POST", attachment);