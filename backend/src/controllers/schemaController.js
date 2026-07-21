import { getDatabaseSchema } from "../services/schemaService.js";

/**
 * Handles database schema retrieval requests.
 * @param {object} req
 * @param {object} res
 */
export const getSchema = async (req, res) => {
  try {
    const schema = await getDatabaseSchema();
    return res.status(200).json(schema);
  } catch (error) {
    console.error("[schemaController] Error fetching schema:", error.message);
    return res.status(500).json({ error: error.message || "Failed to retrieve schema" });
  }
};
