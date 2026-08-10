/**
 * Abstract class representing the AI Provider interface.
 * Any concrete AI provider (e.g., OpenRouter, Gemini, OpenAI) must extend this class
 * and implement its methods.
 */
export class AIProvider {
  /**
   * Generates a SQL statement from a natural language prompt.
   * @param {string} prompt
   * @returns {Promise<{ sql: string }>}
   */
  async generateSQL(prompt) {
    throw new Error("generateSQL() is not implemented by this provider.");
  }

  /**
   * Explains a SQL statement's step-by-step logic.
   * @param {string} sql
   * @returns {Promise<string[]>}
   */
  async explainSQL(sql) {
    throw new Error("explainSQL() is not implemented by this provider.");
  }

  /**
   * Estimates execution row impact and safety warning profiles.
   * @param {string} sql
   * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
   */
  async analyzeQueryImpact(sql) {
    throw new Error("analyzeQueryImpact() is not implemented by this provider.");
  }

  /**
   * Rewrites and optimizes a SQL statement for indexing and performance.
   * @param {string} sql
   * @returns {Promise<{ optimizedSql: string, explanation: string }>}
   */
  async optimizeSQL(sql) {
    throw new Error("optimizeSQL() is not implemented by this provider.");
  }
}
