import { executeQuery } from "../database/mysql.js";

/**
 * Service to store and retrieve natural language prompts and generated SQL.
 * Responsibility: Manage persistent history logs in the query_history table.
 */

const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS query_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt TEXT NOT NULL,
    sql_query TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Ensures that the query_history table exists in the database.
 */
export const initHistory = async () => {
  try {
    await executeQuery(CREATE_TABLE_QUERY);
  } catch (error) {
    console.error("[historyService] Failed to initialize history table:", error);
    throw new Error(`History initialization failed: ${error.message}`);
  }
};

/**
 * Saves a new query log entry.
 * @param {string} prompt The user's natural language prompt
 * @param {string} sql The generated SQL query
 * @returns {Promise<any>}
 */
export const saveHistory = async (prompt, sql) => {
  if (!prompt || !prompt.trim() || !sql || !sql.trim()) {
    throw new Error("Prompt and SQL query are required to log history.");
  }

  // Ensure table structure exists
  await initHistory();

  try {
    const insertQuery = `
      INSERT INTO query_history (prompt, sql_query)
      VALUES (?, ?);
    `;
    const result = await executeQuery(insertQuery, [prompt, sql]);
    return result;
  } catch (error) {
    console.error("[historyService] Failed to save query history:", error);
    throw new Error(`Failed to save history: ${error.message}`);
  }
};

/**
 * Retrieves all query history records, ordered by created_at descending.
 * @returns {Promise<Array<{ id: number, prompt: string, sql_query: string, created_at: string }>>}
 */
export const getHistory = async () => {
  // Ensure table structure exists
  await initHistory();

  try {
    const selectQuery = `
      SELECT id, prompt, sql_query, created_at 
      FROM query_history 
      ORDER BY created_at DESC;
    `;
    const rows = await executeQuery(selectQuery);
    return rows;
  } catch (error) {
    console.error("[historyService] Failed to retrieve query history:", error);
    throw new Error(`Failed to retrieve history: ${error.message}`);
  }
};
