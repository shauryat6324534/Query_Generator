/**
 * Gemini Service
 * Handles natural language prompt to SQL translation.
 * Currently returns a hardcoded response for Sprint 3.
 */

/**
 * Generates SQL from a natural language prompt.
 * @param {string} prompt
 * @returns {Promise<{ sql: string }>}
 */
export const generateSQL = async (prompt) => {
  // Hardcoded response as required for this sprint
  return {
    sql: "SELECT * FROM Employee;",
  };
};
