import { getPoolForSession } from "./db.js";
import { validateSQLSafety } from "../utils/sqlSafety.js";

/**
 * Executes a raw SQL query against the database connection pool.
 * @param {string} sql
 * @param {Array} [params=[]]
 * @param {string} [sessionId=null]
 * @returns {Promise<any>} The query results (rows or mutation status).
 */
export const executeQuery = async (sql, params = [], sessionId = null) => {
  // Backend-side SQL safety validation immediately before execution
  validateSQLSafety(sql);

  const pool = getPoolForSession(sessionId);
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error("[Database Runner] Error running query:");
    console.error(`- Message: ${error.message}`);
    console.error(`- Code: ${error.code}`);
    console.error(`- Errno: ${error.errno}`);
    console.error(`- SQL Message: ${error.sqlMessage}`);
    console.error(`- SQL State: ${error.sqlState}`);
    console.error(`- Executed SQL: ${sql}`);
    console.error(`- Params: ${JSON.stringify(params)}`);
    console.error("- Stack Trace:", error.stack);
    
    // Throw the original error directly to preserve stack traces
    throw error;
  }
};
