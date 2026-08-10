import { defaultPool } from "../database/db.js";

/**
 * Service to store and retrieve natural language prompts and generated SQL.
 * Responsibility: Manage persistent history logs in the query_history table.
 */

const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS query_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 0,
    prompt TEXT NOT NULL,
    sql_query TEXT NOT NULL,
    db_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Ensures that the query_history table exists in the database.
 */
export const initHistory = async () => {
  try {
    await defaultPool.query(CREATE_TABLE_QUERY);
    
    // Check if db_name column exists, if not, alter table to add it
    try {
      const [columns] = await defaultPool.query("SHOW COLUMNS FROM query_history LIKE 'db_name'");
      if (columns.length === 0) {
        await defaultPool.query("ALTER TABLE query_history ADD COLUMN db_name VARCHAR(255) DEFAULT 'ai_sql_generator'");
      }
    } catch (colErr) {
      console.error("[historyService] Failed to check/add db_name column:", colErr);
    }

    // Check if user_id column exists, if not, alter table to add it (dynamic migration)
    try {
      const [columns] = await defaultPool.query("SHOW COLUMNS FROM query_history LIKE 'user_id'");
      if (columns.length === 0) {
        await defaultPool.query("ALTER TABLE query_history ADD COLUMN user_id INT NOT NULL DEFAULT 0");
      }
    } catch (colErr) {
      console.error("[historyService] Failed to check/add user_id column:", colErr);
    }
  } catch (error) {
    console.error("[historyService] Failed to initialize history table:", error);
    throw new Error(`History initialization failed: ${error.message}`);
  }
};

/**
 * Saves a new query log entry.
 * @param {number} userId The owner user ID
 * @param {string} prompt The user's natural language prompt
 * @param {string} sql The generated SQL query
 * @param {string} [dbName="ai_sql_generator"] The database name associated
 * @returns {Promise<any>}
 */
export const saveHistory = async (userId, prompt, sql, dbName = "ai_sql_generator") => {
  if (userId === undefined || userId === null) {
    throw new Error("User ID is required to log query history.");
  }
  if (!prompt || !prompt.trim() || !sql || !sql.trim()) {
    throw new Error("Prompt and SQL query are required to log history.");
  }

  // Ensure table structure exists
  await initHistory();

  try {
    const insertQuery = `
      INSERT INTO query_history (user_id, prompt, sql_query, db_name)
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await defaultPool.query(insertQuery, [userId, prompt, sql, dbName]);
    return result;
  } catch (error) {
    console.error("[historyService] Failed to save query history:", error);
    throw new Error(`Failed to save history: ${error.message}`);
  }
};

/**
 * Retrieves all query history records for a specific user.
 * @param {number} userId The owner user ID
 * @returns {Promise<Array<{ id: number, prompt: string, sql_query: string, db_name: string, created_at: string }>>}
 */
export const getHistory = async (userId) => {
  if (userId === undefined || userId === null) {
    throw new Error("User ID is required to retrieve query history.");
  }

  // Ensure table structure exists
  await initHistory();

  try {
    const selectQuery = `
      SELECT id, prompt, sql_query, db_name, created_at 
      FROM query_history 
      WHERE user_id = ?
      ORDER BY created_at DESC;
    `;
    const [rows] = await defaultPool.query(selectQuery, [userId]);
    return rows;
  } catch (error) {
    console.error("[historyService] Failed to retrieve query history:", error);
    throw new Error(`Failed to retrieve history: ${error.message}`);
  }
};
