import { runQuery } from "../services/executionService.js";
import { getSessionEntry } from "../database/db.js";

/**
 * Controller to handle query execution.
 * @param {object} req
 * @param {object} res
 */
export const executeQuery = async (req, res) => {
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

    const results = await runQuery(sql, sessionId);
    return res.status(200).json(results);
  } catch (error) {
    console.error("[executeController] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
