import { runQuery } from "../services/executionService.js";

/**
 * Controller to handle query execution.
 * @param {object} req
 * @param {object} res
 */
export const executeQuery = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const results = await runQuery(sql);
    return res.status(200).json(results);
  } catch (error) {
    console.error("[executeController] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
