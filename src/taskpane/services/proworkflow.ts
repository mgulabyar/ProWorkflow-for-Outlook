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


export interface ProWorkflowConfig {
  apiKey: string;
  email: string;
}

export interface TaskPayload {
  name: string;
  description?: string;
  contactid?: string;
  priorityid?: number;
  duedate?: string;
  taskgroupid?: string;
}

const STORAGE_KEYS = {
  apiKey: "pw_api_key",
  email: "pw_email",
  password: "pw_password",
} as const;

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
    localStorage.setItem(STORAGE_KEYS.password, password);
  }
};

export const clearConfig = (): void => {
  localStorage.removeItem(STORAGE_KEYS.apiKey);
  localStorage.removeItem(STORAGE_KEYS.email);
  localStorage.removeItem(STORAGE_KEYS.password);
};

export const hasActiveSessionPassword = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.password) !== null;
};

const buildAuthHeaders = (config: ProWorkflowConfig): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: config.apiKey,
  };

  const storedPassword = localStorage.getItem(STORAGE_KEYS.password);
  if (storedPassword) {
    const credentials = btoa(`${config.email}:${storedPassword}`);
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
    throw new ProWorkflowApiError(
      `[NON-JSON RESPONSE] Got HTTP ${response.status} but the body wasn't valid JSON (endpoint: ${endpoint}). This usually means a proxy returned an error/rate-limit page instead of forwarding to ProWorkflow. Check the Network tab.`,
      response.status,
      null
    );
  }

  return responseBody as T;
};

export const testConnection = async (config: ProWorkflowConfig, password?: string): Promise<boolean> => {
  const headers: Record<string, string> = {
    apikey: config.apiKey,
  };

  const storedPassword = password || localStorage.getItem(STORAGE_KEYS.password);
  if (storedPassword) {
    const credentials = btoa(`${config.email}:${storedPassword}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  try {
    const targetUrl = "https://api.proworkflow.net/contacts";
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
      method: "GET",
      headers,
    });
    return response.ok;
  } catch {
    return false;
  }
};

/* --- FIXED: Added &contactid=all to fetch all active projects --- */
export const getProjects = () => makeProWorkflowRequest("/projects?status=active&contactid=all");

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