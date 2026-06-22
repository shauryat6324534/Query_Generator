import { GoogleGenerativeAI } from "@google/generative-ai";
import { retryGemini } from "../utils/retryGemini.js";

/**
 * Generates SQL from a natural language prompt using Google Gemini API.
 * @param {string} prompt
 * @returns {Promise<{ sql: string }>}
 */
export const generateSQL = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment variables. Please check your backend/.env file."
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Using gemini-1.5-flash as the fast, stable translation engine
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are an expert SQL generation assistant. Translate the given natural language prompt into a single, syntactically correct SQL query. " +
        "Do not wrap your output in markdown code blocks (like ```sql ... ```). " +
        "Do not include any explanations, comments, HTML tags, or introductory text. " +
        "Return ONLY the raw SQL statement.",
    });

    const result = await retryGemini(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })
    );

    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Received empty response from Gemini API.");
    }

    // Clean up potential markdown formatting block wrapper artifacts in case the model ignored instructions
    let sql = responseText.trim();
    if (sql.startsWith("```")) {
      sql = sql.replace(/^```(sql)?\n?/i, "").replace(/\n?```$/, "");
    }
    sql = sql.trim();

    return { sql };
  } catch (error) {
    console.error("[geminiService] Error calling Gemini API:", error);
    throw new Error(
      `Gemini SQL Generation failed: ${error.message || "Unknown API error"}`
    );
  }
};
