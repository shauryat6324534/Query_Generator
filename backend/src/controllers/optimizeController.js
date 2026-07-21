import { optimizeSQL } from "../services/optimizationService.js";

/**
 * Handles incoming query optimization requests.
 * @param {object} req
 * @param {object} res
 */
export const optimizeQuery = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const result = await optimizeSQL(sql);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[optimizeController] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize query" });
  }
};
