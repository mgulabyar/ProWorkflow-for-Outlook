
// export interface ProWorkflowConfig {
//   apiKey: string;
//   email: string;
// }

// export interface TaskPayload {
//   name: string;
//   description?: string;
//   contactid?: string;
//   priorityid?: number;
//   duedate?: string;
//   taskgroupid?: string;
// }

// const STORAGE_KEYS = {
//   apiKey: "pw_api_key",
//   email: "pw_email",
//   password: "pw_password",
// } as const;

// const CUSTOM_PROXY_BASE_URL = (import.meta as any).env?.VITE_PROWORKFLOW_PROXY_URL as string | undefined;

// const buildRequestUrl = (endpoint: string): string => {
//   if (CUSTOM_PROXY_BASE_URL) {
//     return `${CUSTOM_PROXY_BASE_URL}${endpoint}`;
//   }
//   const targetUrl = `https://api.proworkflow.net${endpoint}`;
//   return `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
// };

// const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// export class ProWorkflowApiError extends Error {
//   status: number;
//   body: unknown;

//   constructor(message: string, status: number, body: unknown) {
//     super(message);
//     this.name = "ProWorkflowApiError";
//     this.status = status;
//     this.body = body;
//   }
// }

// export const getStoredConfig = (): ProWorkflowConfig | null => {
//   const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey);
//   const email = localStorage.getItem(STORAGE_KEYS.email);

//   if (apiKey && email) {
//     return { apiKey, email };
//   }
//   return null;
// };

// export const saveConfig = (config: ProWorkflowConfig, password?: string): void => {
//   const apiKey = config.apiKey?.trim();
//   const email = config.email?.trim();

//   if (!apiKey) {
//     throw new Error("API key is required.");
//   }
//   if (!email || !EMAIL_REGEX.test(email)) {
//     throw new Error("A valid email address is required.");
//   }

//   localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
//   localStorage.setItem(STORAGE_KEYS.email, email);

//   if (password) {
//     localStorage.setItem(STORAGE_KEYS.password, password);
//   }
// };

// export const clearConfig = (): void => {
//   localStorage.removeItem(STORAGE_KEYS.apiKey);
//   localStorage.removeItem(STORAGE_KEYS.email);
//   localStorage.removeItem(STORAGE_KEYS.password);
// };

// export const hasActiveSessionPassword = (): boolean => {
//   return localStorage.getItem(STORAGE_KEYS.password) !== null;
// };

// const buildAuthHeaders = (config: ProWorkflowConfig): Record<string, string> => {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     apikey: config.apiKey,
//   };

//   const storedPassword = localStorage.getItem(STORAGE_KEYS.password);
//   if (storedPassword) {
//     const credentials = btoa(`${config.email}:${storedPassword}`);
//     headers["Authorization"] = `Basic ${credentials}`;
//   }

//   return headers;
// };

// export const makeProWorkflowRequest = async <T = unknown>(
//   endpoint: string,
//   method: string = "GET",
//   body?: unknown
// ): Promise<T> => {
//   const config = getStoredConfig();
//   if (!config) {
//     throw new Error("Configuration not found. Please connect your ProWorkflow account first.");
//   }

//   const headers = buildAuthHeaders(config);
//   const url = buildRequestUrl(endpoint);

//   let response: Response;
//   try {
//     response = await fetch(url, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : undefined,
//     });
//   } catch (networkErr) {
//     console.error("[ProWorkflow] Network request failed before reaching any server:", {
//       url,
//       endpoint,
//       method,
//       error: networkErr,
//     });
//     throw new ProWorkflowApiError(
//       `[NETWORK] Could not reach the server at all (endpoint: ${endpoint}). This points to a connectivity/proxy issue, not a ProWorkflow data issue. Check your internet connection and the browser Network tab.`,
//       0,
//       null
//     );
//   }

//   let responseBody: unknown = null;
//   let parseFailed = false;
//   try {
//     responseBody = await response.json();
//   } catch {
//     parseFailed = true;
//   }

//   console.groupCollapsed(`[ProWorkflow] ${method} ${endpoint} -> ${response.status}`);
//   console.log("URL:", url);
//   console.log("Status:", response.status, response.statusText);
//   console.log("Parsed as JSON:", !parseFailed);
//   console.log("Body:", responseBody);
//   console.groupEnd();

//   if (!response.ok) {
//     throw new ProWorkflowApiError(
//       `[HTTP ${response.status}] ${response.statusText || "Request failed"} (endpoint: ${endpoint}). ${
//         response.status === 401 || response.status === 403
//           ? "This looks like an authentication/permission problem."
//           : response.status === 404
//           ? "This looks like a wrong or unsupported endpoint path."
//           : "Check the response body in the console for details."
//       }`,
//       response.status,
//       responseBody
//     );
//   }

//   if (parseFailed && response.status !== 204) {
//     throw new ProWorkflowApiError(
//       `[NON-JSON RESPONSE] Got HTTP ${response.status} but the body wasn't valid JSON (endpoint: ${endpoint}). This usually means a proxy returned an error/rate-limit page instead of forwarding to ProWorkflow. Check the Network tab.`,
//       response.status,
//       null
//     );
//   }

//   return responseBody as T;
// };

// export const testConnection = async (config: ProWorkflowConfig, password?: string): Promise<boolean> => {
//   const headers: Record<string, string> = {
//     apikey: config.apiKey,
//   };

//   const storedPassword = password || localStorage.getItem(STORAGE_KEYS.password);
//   if (storedPassword) {
//     const credentials = btoa(`${config.email}:${storedPassword}`);
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

// /* --- FIXED: Added &contactid=all to fetch all active projects --- */
// export const getProjects = () => makeProWorkflowRequest("/projects?status=active&contactid=all");

// export const getTaskGroups = (projectId: string) =>
//   makeProWorkflowRequest(`/projects/${projectId}/taskgroups`);

// export const getStaff = () => makeProWorkflowRequest("/contacts/staff");

// export const createTask = <T = { id: string }>(projectId: string, taskData: TaskPayload) =>
//   makeProWorkflowRequest<T>(`/projects/${projectId}/tasks`, "POST", taskData);

// export const getTasksForTaskGroup = (projectId: string, taskGroupId: string) =>
//   makeProWorkflowRequest(`/projects/${projectId}/taskgroups/${taskGroupId}/tasks`);

// export const getTaskDetails = (projectId: string, taskId: string) =>
//   makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`);

// export const updateTask = (projectId: string, taskId: string, taskData: Partial<TaskPayload>) =>
//   makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`, "PUT", taskData);

// export interface TaskAttachmentPayload {
//   name: string;
//   contentType: string;
//   contentBytes: string;
// }

// export const uploadTaskAttachment = (taskId: string, attachment: TaskAttachmentPayload) =>
//   makeProWorkflowRequest(`/tasks/${taskId}/files`, "POST", attachment);



/**
 * ProWorkflow API integration.
 *
 * IMPORTANT SECURITY NOTE:
 * By default, requests are routed through a public CORS proxy (corsproxy.io)
 * so the add-in works out of the box during development. This is TEMPORARY —
 * it sends API keys, credentials, and (for this add-in) email content and
 * attachments through infrastructure you don't control.
 *
 * Before shipping to real users, build your own backend/proxy (e.g. a small
 * Node.js server or Azure Function) that forwards requests to
 * https://api.proworkflow.net, and point this module at it by setting
 * VITE_PROWORKFLOW_PROXY_URL (e.g. https://yourapp.com/api/proworkflow).
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

// If you've set up your own backend/proxy, point this at it via
// VITE_PROWORKFLOW_PROXY_URL (e.g. https://yourapp.com/api/proworkflow) and
// requests will be sent as `${VITE_PROWORKFLOW_PROXY_URL}${endpoint}`.
//
// Until that backend exists, requests fall back to a public CORS proxy so
// the add-in keeps working. This fallback is TEMPORARY — replace it with
// your own backend before this ships to real users, since it currently
// routes API keys, credentials, and email content through infrastructure
// you don't control.
const CUSTOM_PROXY_BASE_URL = (import.meta as any).env?.VITE_PROWORKFLOW_PROXY_URL as string | undefined;

const buildRequestUrl = (endpoint: string): string => {
  if (CUSTOM_PROXY_BASE_URL) {
    return `${CUSTOM_PROXY_BASE_URL}${endpoint}`;
  }
  const targetUrl = `https://api.proworkflow.net${endpoint}`;
  return `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
};

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
  const url = buildRequestUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch() itself threw — the request never got a response at all.
    // This means: offline, DNS failure, CORS block, or the proxy/server is unreachable.
    // This is NOT a "your ProWorkflow account has no data" situation — it's an
    // infrastructure/connectivity problem before ProWorkflow was ever reached.
    console.error("[ProWorkflow] Network request failed before reaching any server:", {
      url,
      endpoint,
      method,
      error: networkErr,
    });
    throw new ProWorkflowApiError(
      `[NETWORK] Could not reach the server at all (endpoint: ${endpoint}). This points to a connectivity/proxy issue, not a ProWorkflow data issue. Check your internet connection and the browser Network tab.`,
      0,
      null
    );
  }

  let responseBody: unknown = null;
  let parseFailed = false;
  try {
    responseBody = await response.json();
  } catch {
    parseFailed = true;
  }

  console.groupCollapsed(`[ProWorkflow] ${method} ${endpoint} -> ${response.status}`);
  console.log("URL:", url);
  console.log("Status:", response.status, response.statusText);
  console.log("Parsed as JSON:", !parseFailed);
  console.log("Body:", responseBody);
  console.groupEnd();

  if (!response.ok) {
    // The request reached a server and got a real HTTP error back.
    // 401/403 -> auth/credentials issue. 404 -> wrong endpoint path.
    // Anything else -> server-side error. All of these are useful signals
    // distinct from "request never arrived".
    throw new ProWorkflowApiError(
      `[HTTP ${response.status}] ${response.statusText || "Request failed"} (endpoint: ${endpoint}). ${
        response.status === 401 || response.status === 403
          ? "This looks like an authentication/permission problem."
          : response.status === 404
          ? "This looks like a wrong or unsupported endpoint path."
          : "Check the response body in the console for details."
      }`,
      response.status,
      responseBody
    );
  }

  if (parseFailed && response.status !== 204) {
    // Got a 200 OK, but the body wasn't JSON. Usually means a proxy served
    // an error/rate-limit HTML page while still returning status 200 —
    // i.e. the request likely never truly reached ProWorkflow.
    throw new ProWorkflowApiError(
      `[NON-JSON RESPONSE] Got HTTP ${response.status} but the body wasn't valid JSON (endpoint: ${endpoint}). This usually means a proxy returned an error/rate-limit page instead of forwarding to ProWorkflow. Check the Network tab.`,
      response.status,
      null
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
    const response = await fetch(buildRequestUrl("/contacts"), {
      method: "GET",
      headers,
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getProjects = () => makeProWorkflowRequest("/projects?status=active");

// TEMPORARY DIAGNOSTIC — remove once the empty-projects issue is confirmed/resolved.
// Fetches ALL projects regardless of status, to check whether the account has
// any projects at all, or specifically none with status=active.
export const getAllProjectsDebug = () => makeProWorkflowRequest("/projects");

export const getTaskGroups = (projectId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/taskgroups`);

export const getStaff = () => makeProWorkflowRequest("/contacts/staff");

export const createTask = <T = { id: string }>(projectId: string, taskData: TaskPayload) =>
  makeProWorkflowRequest<T>(`/projects/${projectId}/tasks`, "POST", taskData);


export const getTasksForTaskGroup = (projectId: string, taskGroupId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/taskgroups/${taskGroupId}/tasks`);

export const getTaskDetails = (projectId: string, taskId: string) =>
  makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`);


export const updateTask = (projectId: string, taskId: string, taskData: Partial<TaskPayload>) =>
  makeProWorkflowRequest(`/projects/${projectId}/tasks/${taskId}`, "PUT", taskData);

export interface TaskAttachmentPayload {
  name: string;
  contentType: string;
  contentBytes: string;
}


export const uploadTaskAttachment = (taskId: string, attachment: TaskAttachmentPayload) =>
  makeProWorkflowRequest(`/tasks/${taskId}/files`, "POST", attachment);

