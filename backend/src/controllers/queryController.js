import { generateSQL } from "../services/geminiService.js";
import { saveHistory } from "../services/historyService.js";

/**
 * Handles incoming query translation requests.
 * @param {object} req
 * @param {object} res
 */
export const generateQuery = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateSQL(prompt);

    // Auto-save translation to query history database
    try {
      await saveHistory(prompt, result.sql);
    } catch (historyError) {
      console.error("[queryController] Failed to auto-save history:", historyError.message);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[queryController] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
