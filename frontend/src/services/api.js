const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Reads a cookie value by name.
 * Used for extracting CSRF tokens.
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

/**
 * Builds request headers, automatically appending CSRF token and Session ID if available.
 */
const getHeaders = (sessionId = null) => {
  const csrfToken = getCookie("_csrf");
  return {
    "Content-Type": "application/json",
    ...(sessionId ? { "x-session-id": sessionId } : {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {})
  };
};

/**
 * Pings the backend health endpoint.
 * @returns {Promise<{ status: string }>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to reach backend server");
  }
};

/**
 * Connects to a custom database and retrieves a session ID.
 * @param {object} config { host, port, user, password, database }
 * @returns {Promise<{ sessionId: string, database: string }>}
 */
export const connectDatabase = async (config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/connect`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(config),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to connect to database");
  }
};

/**
 * Tests database credentials.
 * @param {object} config { host, port, user, password, database }
 * @returns {Promise<{ success: boolean }>}
 */
export const testDatabase = async (config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/test`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(config),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Test connection failed");
  }
};

/**
 * Disconnects the custom database pool session.
 * @param {string} sessionId
 * @returns {Promise<{ message: string }>}
 */
export const disconnectDatabase = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/disconnect`, {
      method: "POST",
      headers: getHeaders(sessionId),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to disconnect database");
  }
};

/**
 * Generates SQL query from a natural language prompt.
 * @param {string} prompt
 * @param {string} [sessionId=null]
 * @returns {Promise<{ sql: string }>}
 */
export const generateQuery = async (prompt, sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-query`, {
      method: "POST",
      headers: getHeaders(sessionId),
      body: JSON.stringify({ prompt }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to generate query");
  }
};

/**
 * Explains a SQL statement's logical flow.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<{ explanation: string[] }>}
 */
export const explainQuery = async (sql, sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain-query`, {
      method: "POST",
      headers: getHeaders(sessionId),
      body: JSON.stringify({ sql }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to explain query");
  }
};

/**
 * Estimates query execution rows and risk profiles.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
 */
export const analyzeImpact = async (sql, sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-impact`, {
      method: "POST",
      headers: getHeaders(sessionId),
      body: JSON.stringify({ sql }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to analyze query impact");
  }
};

/**
 * Executes a SQL statement against the active database.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<any[]>} Rows or execution metadata
 */
export const executeQuery = async (sql, sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute-query`, {
      method: "POST",
      headers: getHeaders(sessionId),
      body: JSON.stringify({ sql }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to execute query");
  }
};

/**
 * Fetches the user query translation history logs.
 * @returns {Promise<Array<{ id: number, prompt: string, sql_query: string, db_name: string, created_at: string }>>}
 */
export const getHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to fetch query history");
  }
};

/**
 * Converts execution result records to CSV format.
 * @param {any[]} results
 * @returns {Promise<Blob>}
 */
export const exportCSV = async (results) => {
  try {
    const response = await fetch(`${API_BASE_URL}/export-csv`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(results),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    throw new Error(error.message || "Failed to export query results to CSV");
  }
};

/**
 * Fetches the active database schema columns and tables.
 * @param {string} [sessionId=null]
 * @returns {Promise<Array<{ tableName: string, columns: Array<{ columnName: string, dataType: string, isPrimaryKey: boolean, isNullable: boolean }> }>>}
 */
export const getSchema = async (sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/schema`, {
      headers: getHeaders(sessionId),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to fetch database schema");
  }
};

/**
 * Optimizes a SQL query for performance using the Gemini model.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<{ optimizedSql: string, explanation: string }>}
 */
export const optimizeQuery = async (sql, sessionId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/optimize-query`, {
      method: "POST",
      headers: getHeaders(sessionId),
      body: JSON.stringify({ sql }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to optimize SQL query");
  }
};

/**
 * Registers a new user.
 */
export const registerUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Registration failed.");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Registration failed.");
  }
};

/**
 * Authenticates a user.
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Authentication failed.");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Authentication failed.");
  }
};

/**
 * Terminate current user session.
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Logout failed.");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Logout failed.");
  }
};

/**
 * Checks if the user session is active.
 */
export const checkAuthUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Unauthenticated");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Unauthenticated");
  }
};
