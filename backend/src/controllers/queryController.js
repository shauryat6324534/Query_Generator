import { generateSQL } from "../services/aiService.js";
import { saveHistory } from "../services/historyService.js";
import { handleAIError } from "../utils/aiErrorHandler.js";
import { getDatabaseNameForSession, getSessionEntry } from "../database/db.js";

/**
 * Handles incoming query translation requests.
 * @param {object} req
 * @param {object} res
 */
export const generateQuery = async (req, res) => {
  try {
    const { prompt } = req.body;
    const sessionId = req.headers["x-session-id"];
    const userId = req.user.userId;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Access denied: Session ID is required." });
    }

    const session = getSessionEntry(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: "Access denied: Invalid database session or ownership mismatch." });
    }

    const result = await generateSQL(prompt, sessionId);

    // Auto-save translation to query history database
    try {
      const dbName = getDatabaseNameForSession(sessionId);
      await saveHistory(userId, prompt, result.sql, dbName);
    } catch (historyError) {
      console.error("[queryController] Failed to auto-save history:", historyError.message);
    }

    return res.status(200).json(result);
  } catch (error) {
    return handleAIError(error, res, "generation");
  }
};
