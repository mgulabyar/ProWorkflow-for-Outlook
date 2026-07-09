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


export interface ProWorkflowConfig {
  apiKey: string;
  email: string;
  password?: string;
}

export const getStoredConfig = (): ProWorkflowConfig | null => {
  const apiKey = localStorage.getItem("pw_api_key");
  const email = localStorage.getItem("pw_email");
  const pw = localStorage.getItem("pw_password") || "";

  if (apiKey && email) {
    return { apiKey, email, password: pw };
  }
  return null;
};

export const saveConfig = (config: ProWorkflowConfig) => {
  localStorage.setItem("pw_api_key", config.apiKey);
  localStorage.setItem("pw_email", config.email);
  if (config.password) {
    localStorage.setItem("pw_password", config.password);
  }
};

export const clearConfig = () => {
  localStorage.removeItem("pw_api_key");
  localStorage.removeItem("pw_email");
  localStorage.removeItem("pw_password");
};

export const makeProWorkflowRequest = async (endpoint: string, method: string = "GET", body?: any) => {
  const config = getStoredConfig();
  if (!config) throw new Error("Configuration not found");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "apikey": config.apiKey,
  };

  if (config.password) {
    const credentials = btoa(`${config.email}:${config.password}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const targetUrl = `https://api.proworkflow.net${endpoint}`;
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return await response.json();
};

export const testConnection = async (config: ProWorkflowConfig): Promise<boolean> => {
  const headers: HeadersInit = {
    "apikey": config.apiKey,
  };

  if (config.password) {
    const credentials = btoa(`${config.email}:${config.password}`);
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

export const getProjects = async () => {
  return await makeProWorkflowRequest("/projects?status=active");
};

export const getTaskGroups = async (projectId: string) => {
  return await makeProWorkflowRequest(`/projects/${projectId}/taskgroups`);
};

export const getStaff = async () => {
  return await makeProWorkflowRequest("/contacts/staff");
};

export const createTask = async (projectId: string, taskData: any) => {
  return await makeProWorkflowRequest(`/projects/${projectId}/tasks`, "POST", taskData);
};