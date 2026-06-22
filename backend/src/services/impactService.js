import { GoogleGenerativeAI } from "@google/generative-ai";
import { retryGemini } from "../utils/retryGemini.js";

/**
 * Service to perform static safety analysis and row estimates for SQL queries.
 * Responsibility: Accept SQL query, send to Gemini, and parse a JSON structured safety report.
 */

/**
 * Analyzes the potential database impact of a SQL query without executing it.
 * @param {string} sql
 * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
 */
export const analyzeQueryImpact = async (sql) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment variables. Please check your backend/.env file."
    );
  }

  if (!sql || !sql.trim()) {
    throw new Error("SQL query is required for impact analysis.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are an expert database safety and performance analysis assistant. " +
        "Analyze the provided SQL query and estimate its execution impact without running it. " +
        "Return the analysis ONLY as a valid JSON object matching the following structure:\n" +
        "{\n" +
        "  \"riskLevel\": \"LOW\" | \"MEDIUM\" | \"HIGH\",\n" +
        "  \"rowsAffected\": number (estimate of written/deleted/updated rows; 0 for SELECT statements),\n" +
        "  \"rowsReturned\": number (estimate of fetched/returned rows; 0 for write-only statements),\n" +
        "  \"tables\": string[] (list of lowercased table names accessed/modified in the query),\n" +
        "  \"warnings\": string[] (list of clear performance suggestions, missing index notes, or structural risks)\n" +
        "}\n" +
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

    const analysisObj = JSON.parse(cleanText);

    // Enforce default stubs if properties are missing
    return {
      riskLevel: analysisObj.riskLevel || "LOW",
      rowsAffected: typeof analysisObj.rowsAffected === "number" ? analysisObj.rowsAffected : 0,
      rowsReturned: typeof analysisObj.rowsReturned === "number" ? analysisObj.rowsReturned : 0,
      tables: Array.isArray(analysisObj.tables) ? analysisObj.tables : [],
      warnings: Array.isArray(analysisObj.warnings) ? analysisObj.warnings : ["No warnings generated."],
    };
  } catch (error) {
    console.error("[impactService] Error calling Gemini API:", error);
    throw new Error(
      `Gemini SQL Impact Analysis failed: ${error.message || "Unknown API error"}`
    );
  }
};
