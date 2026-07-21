import { GoogleGenerativeAI } from "@google/generative-ai";
import { retryGemini } from "../utils/retryGemini.js";

/**
 * Service to optimize SQL queries using Gemini.
 * Responsibility: Accept SQL query, send to Gemini, and parse JSON response containing optimized SQL and explanation.
 */

/**
 * Optimizes a SQL query for better performance.
 * @param {string} sql
 * @returns {Promise<{ optimizedSql: string, explanation: string }>}
 */
export const optimizeSQL = async (sql) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment variables. Please check your backend/.env file."
    );
  }

  if (!sql || !sql.trim()) {
    throw new Error("SQL query is required for optimization.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are an expert SQL optimization assistant. " +
        "Analyze the provided SQL query and optimize it for performance (e.g. adding index hints, rewriting subqueries to JOINs, simplifying clauses). " +
        "Return the response ONLY as a valid JSON object with two keys: 'optimizedSql' (string) and 'explanation' (string). " +
        "Do not wrap your output in markdown code blocks (like ```json ... ```). " +
        "Return ONLY the raw JSON text.",
    });

    const result = await retryGemini(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: sql }] }],
      })
    );

    const responseText = result.response.text();
    
    if (!responseText) {
      throw new Error("Received empty response from Gemini API.");
    }

    // Clean up potential markdown formatting code blocks
    let cleanText = responseText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }
    cleanText = cleanText.trim();

    const optimizationData = JSON.parse(cleanText);

    if (!optimizationData.optimizedSql || !optimizationData.explanation) {
      throw new Error("Parsed response is missing optimizedSql or explanation fields.");
    }

    return optimizationData;
  } catch (error) {
    console.error("[optimizationService] Error calling Gemini API:", error);
    throw new Error(
      `Gemini SQL Optimization failed: ${error.message || "Unknown API error"}`
    );
  }
};
