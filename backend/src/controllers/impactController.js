import { analyzeQueryImpact } from "../services/impactService.js";

/**
 * Controller to handle query safety and row impact analysis.
 * @param {object} req
 * @param {object} res
 */
export const analyzeImpact = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const impact = await analyzeQueryImpact(sql);
    return res.status(200).json(impact);
  } catch (error) {
    console.error("[impactController] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
