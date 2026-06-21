// import { explainSQL } from "../services/explanationService.js";

// /**
//  * Controller to handle query logic explanation.
//  * @param {object} req
//  * @param {object} res
//  */
// export const explainQuery = async (req, res) => {
//   try {
//     const { sql } = req.body;

//     if (!sql) {
//       return res.status(400).json({ error: "SQL query is required" });
//     }

//     const explanation = await explainSQL(sql);
//     return res.status(200).json({ explanation });
//   } catch (error) {
//     console.error("[explainController] Error:", error);
//     return res.status(500).json({ error: error.message || "Internal server error" });
//   }
// };


import { explainSQL } from "../services/explanationService.js";

/**
 * Controller to handle query explanation requests.
 * @param {object} req
 * @param {object} res
 */
export const explainQuery = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || !sql.trim()) {
      return res.status(400).json({
        error: "SQL query is required",
      });
    }

    const explanation = await explainSQL(sql);

    return res.status(200).json({
      explanation,
    });
  } catch (error) {
    console.error("[explainController] Error:", error);

    const errorMessage = error?.message?.toLowerCase() || "";

    // Gemini quota exceeded
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("too many requests")
    ) {
      return res.status(429).json({
        error:
          "AI explanation quota exceeded. Please try again later.",
      });
    }

    // Gemini/network failures
    if (
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout")
    ) {
      return res.status(503).json({
        error:
          "Unable to connect to the AI explanation service. Please try again later.",
      });
    }

    // Generic fallback
    return res.status(500).json({
      error:
        "Explanation service is temporarily unavailable. Please try again later.",
    });
  }
};