import { getDatabaseSchema } from "../services/schemaService.js";
import { getSessionEntry } from "../database/db.js";

/**
 * Handles database schema retrieval requests.
 * @param {object} req
 * @param {object} res
 */
export const getSchema = async (req, res) => {
  const sessionId = req.headers["x-session-id"];
  const userId = req.user.userId;

  if (!sessionId) {
    return res.status(400).json({ error: "Access denied: Session ID is required." });
  }

  const session = getSessionEntry(sessionId);
  if (!session || session.userId !== userId) {
    return res.status(403).json({ error: "Access denied: Invalid database session or ownership mismatch." });
  }

  try {
    const schema = await getDatabaseSchema(sessionId);
    return res.status(200).json(schema);
  } catch (error) {
    console.error("[schemaController] Error fetching schema:", error.message);
    return res.status(500).json({ error: error.message || "Failed to retrieve schema" });
  }
};
