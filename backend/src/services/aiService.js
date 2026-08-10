import { getAIProvider } from "../providers/providerFactory.js";

// Instantiating the AI provider via the factory abstraction.
// The service layer remains decoupled from concrete provider details.
const provider = getAIProvider();

/**
 * Generates SQL from a natural language prompt.
 * @param {string} prompt
 * @param {string} [sessionId=null]
 * @returns {Promise<{ sql: string }>}
 */
export const generateSQL = async (prompt, sessionId = null) => {
  return await provider.generateSQL(prompt, sessionId);
};

/**
 * Explains a SQL statement's logical flow.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<string[]>}
 */
export const explainSQL = async (sql, sessionId = null) => {
  return await provider.explainSQL(sql, sessionId);
};

/**
 * Estimates query row impact and warning metrics.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
 */
export const analyzeQueryImpact = async (sql, sessionId = null) => {
  return await provider.analyzeQueryImpact(sql, sessionId);
};

/**
 * Rewrites and optimizes a SQL statement.
 * @param {string} sql
 * @param {string} [sessionId=null]
 * @returns {Promise<{ optimizedSql: string, explanation: string }>}
 */
export const optimizeSQL = async (sql, sessionId = null) => {
  return await provider.optimizeSQL(sql, sessionId);
};

