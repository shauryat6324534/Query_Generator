import { getHistory } from "../services/historyService.js";

/**
 * Controller to handle query history retrieval.
 * @param {object} req
 * @param {object} res
 */
export const fetchHistory = async (req, res) => {
  try {
    const history = await getHistory();
    return res.status(200).json(history);
  } catch (error) {
    console.error("[historyController] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
