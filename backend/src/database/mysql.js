import pool from "./db.js";

/**
 * Executes a raw SQL query against the database connection pool.
 * @param {string} sql
 * @param {Array} [params=[]]
 * @returns {Promise<any>} The query results (rows or mutation status).
 */
export const executeQuery = async (sql, params = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error("[Database Runner] Error running query:", error.message);
    throw new Error(`Database execution failed: ${error.message}`);
  }
};
