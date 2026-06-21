import { convertToCSV } from "../services/exportService.js";

/**
 * Controller to handle SQL query results CSV export.
 * @param {object} req
 * @param {object} res
 */
export const exportCSV = async (req, res) => {
  try {
    const { results, data } = req.body;
    
    // Flexible payload parsing to support arrays directly or nested under results/data properties
    const payload = Array.isArray(req.body)
      ? req.body
      : (results || data || req.body.results || req.body.data);

    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ error: "A non-empty data array is required for export." });
    }

    const csvContent = await convertToCSV(payload);

    // Set download headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=query_results.csv");
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("[exportController] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
