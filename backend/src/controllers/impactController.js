import { analyzeQueryImpact } from "../services/aiService.js";
import { handleAIError } from "../utils/aiErrorHandler.js";
import { getSessionEntry } from "../database/db.js";

/**
 * Controller to handle query safety and row impact analysis.
 * @param {object} req
 * @param {object} res
 */
export const analyzeImpact = async (req, res) => {
  try {
    const { sql } = req.body;
    const sessionId = req.headers["x-session-id"];
    const userId = req.user.userId;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    // Verify session ownership if a dynamic session ID is supplied
    if (sessionId) {
      const session = getSessionEntry(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: "Access denied: Invalid database session or ownership mismatch." });
      }
    }

    const impact = await analyzeQueryImpact(sql, sessionId);
    return res.status(200).json(impact);
  } catch (error) {
    return handleAIError(error, res, "impact analysis");
  }
};
