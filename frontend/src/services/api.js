const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Pings the backend health endpoint.
 * @returns {Promise<{ status: string }>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to reach backend server");
  }
};

/**
 * Generates SQL query from a natural language prompt.
 * @param {string} prompt
 * @returns {Promise<{ sql: string }>}
 */
export const generateQuery = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
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
 * @returns {Promise<{ explanation: string[] }>}
 */
export const explainQuery = async (sql) => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
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
 * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
 */
export const analyzeImpact = async (sql) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
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
 * @returns {Promise<any[]>} Rows or execution metadata
 */
export const executeQuery = async (sql) => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
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
 * @returns {Promise<Array<{ id: number, prompt: string, sql_query: string, created_at: string }>>}
 */
export const getHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results),
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
