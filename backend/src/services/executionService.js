import { executeQuery } from "../database/mysql.js";

/**
 * Service to execute generated SQL statements and retrieve results.
 * Responsibility: Receive queries, check input presence, run against DB layer, and return results.
 */

/**
 * Executes a SQL statement against the active database.
 * @param {string} sql
 * @returns {Promise<any>} Rows list (for read SELECT statements) or database metadata status (for writes/updates).
 */
export const runQuery = async (sql) => {
  if (!sql || !sql.trim()) {
    throw new Error("SQL query statement is required for execution.");
  }

  try {
    const results = await executeQuery(sql);
    return results;
  } catch (error) {
    console.error("[executionService] Query execution failed:", error);
    throw new Error(`Query execution failed: ${error.message}`);
  }
};
