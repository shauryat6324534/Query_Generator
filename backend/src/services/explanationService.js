import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Service to generate human-readable SQL explanations using Gemini.
 * Responsibility: Accept SQL query, send to Gemini, and parse step-by-step JSON array response.
 */

/**
 * Explains a SQL query in simple English.
 * @param {string} sql
 * @returns {Promise<string[]>} A list of logical steps explaining the query.
 */
export const explainSQL = async (sql) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured in the environment variables. Please check your backend/.env file."
    );
  }

  if (!sql || !sql.trim()) {
    throw new Error("SQL query is required for explanation.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction:
        "You are an expert SQL query explanation assistant. " +
        "Analyze the provided SQL query and explain its logic step-by-step in simple, plain English. " +
        "Return the explanation ONLY as a valid JSON array of strings, where each string represents a single logical step. " +
        "Do not include SQL query code or syntax blocks in the output. " +
        "Example output format:\n" +
        "[\n" +
        "  \"Selects the product ID and name from the products table.\",\n" +
        "  \"Filters rows to keep only items whose stock is equal to 0.\"\n" +
        "]\n" +
        "Do not wrap your output in markdown code blocks (like ```json ... ```). " +
        "Return ONLY the raw JSON text.",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: sql }] }],
    });

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

    const explanationArray = JSON.parse(cleanText);

    if (!Array.isArray(explanationArray)) {
      throw new Error("Parsed response is not a JSON array.");
    }

    return explanationArray;
  } catch (error) {
    console.error("[explanationService] Error calling Gemini API:", error);
    throw new Error(
      `Gemini SQL Explanation failed: ${error.message || "Unknown API error"}`
    );
  }
};
