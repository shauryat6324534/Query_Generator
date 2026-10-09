import { explainSQL } from "../services/aiService.js";
import { handleAIError } from "../utils/aiErrorHandler.js";
import { getSessionEntry } from "../database/db.js";

/**
 * Controller to handle query explanation requests.
 * @param {object} req
 * @param {object} res
 */
export const explainQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    const sessionId = req.headers["x-session-id"];
    const userId = req.user.userId;

    if (!sql || !sql.trim()) {
      return res.status(400).json({
        error: "SQL query is required",
      });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Access denied: Session ID is required." });
    }

    const session = getSessionEntry(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: "Access denied: Invalid database session or ownership mismatch." });
    }

    const explanation = await explainSQL(sql, sessionId);

    return res.status(200).json({
      explanation,
    });
  } catch (error) {
    return handleAIError(error, res, "explanation");
  }
};
