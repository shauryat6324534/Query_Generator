import { AIProvider } from "./aiProvider.js";
import { openai } from "../utils/openRouterClient.js";
import { getDatabaseSchema } from "../services/schemaService.js";

/**
 * RAG-Ready prompt builder context provider.
 * Extracts mentioned tables/columns from the prompt or query text to build a minimized schema context.
 */
const buildSchemaContext = (text, fullSchema) => {
  if (!fullSchema || fullSchema.length === 0) return "";
  const normalizedText = (text || "").toLowerCase();
  const relevantTables = [];
  const otherTables = [];

  fullSchema.forEach((table) => {
    const isTableMentioned = normalizedText.includes(table.tableName.toLowerCase());
    const isColumnMentioned = table.columns.some(col => normalizedText.includes(col.columnName.toLowerCase()));

    if (isTableMentioned || isColumnMentioned) {
      relevantTables.push(table);
    } else {
      otherTables.push(table.tableName);
    }
  });

  let context = "\nActive Database Context:\n";
  if (relevantTables.length > 0) {
    context += "Relevant Tables & Columns:\n" + relevantTables.map(t => {
      const cols = t.columns.map(c => `${c.columnName} (${c.dataType}${c.isPrimaryKey ? ', primary key' : ''})`).join(", ");
      return `- Table ${t.tableName} (${cols})`;
    }).join("\n") + "\n";
  }

  if (otherTables.length > 0) {
    context += `Other Available Tables (columns hidden): ${otherTables.join(", ")}\n`;
  }

  return context;
};

/**
 * Cleans safety guardrails output lines (like NVIDIA NeMo / AEGIS) from raw AI response text.
 */
const cleanAIResponse = (text) => {
  if (!text) return "";
  let cleaned = text.trim();
  // Strip NeMo Guardrails safety lines (case-insensitive, multiline matches)
  cleaned = cleaned.replace(/^(user|response)\s*safety:\s*(safe|unsafe)\s*$/gim, "");
  return cleaned.trim();
};

/**
 * Extracts a syntactically clean SQL query statement from the AI response.
 * Uses comment-cleaning and code block stripping as defensive fallback.
 */
const extractSQLFromResponse = (text) => {
  let cleaned = cleanAIResponse(text);
  
  // Extract content inside code blocks if present
  const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1];
  }
  
  cleaned = cleaned.trim();
  
  // Extract starting from first SQL keyword to filter out any introductory conversational text
  const sqlKeywords = ["SELECT", "WITH", "INSERT", "UPDATE", "DELETE", "MERGE", "REPLACE", "CREATE", "ALTER", "DROP", "SHOW", "DESCRIBE", "EXPLAIN"];
  const lines = cleaned.split("\n");
  let startIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim().toUpperCase();
    for (const keyword of sqlKeywords) {
      if (trimmedLine.startsWith(keyword) || trimmedLine.startsWith(`(${keyword}`)) {
        startIndex = i;
        break;
      }
    }
    if (startIndex !== -1) break;
  }
  
  if (startIndex !== -1) {
    cleaned = lines.slice(startIndex).join("\n").trim();
  }
  
  // Fail-safe validation: Ensure at least one SQL keyword exists in the extracted text
  if (!cleaned || !sqlKeywords.some(k => cleaned.toUpperCase().includes(k))) {
    throw new Error("AI provider returned an invalid, empty, or moderated response. Please try again.");
  }
  
  return cleaned;
};

/**
 * Concrete implementation of the AIProvider interface utilizing OpenRouter.
 */
export class OpenRouterProvider extends AIProvider {
  /**
   * Generates a SQL query from natural language using OpenRouter.
   * @param {string} prompt
   * @param {string} [sessionId=null]
   * @returns {Promise<{ sql: string }>}
   */
  async generateSQL(prompt, sessionId = null) {
    const modelName = process.env.MODEL_NAME;
    
    if (!modelName || modelName.trim() === "") {
      throw new Error("MODEL_NAME is not configured in the environment variables.");
    }
    
    if (!openai.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in the environment variables.");
    }

    let schemaContext = "";
    try {
      const schema = await getDatabaseSchema(sessionId);
      schemaContext = buildSchemaContext(prompt, schema);
    } catch (err) {
      console.warn("[OpenRouterProvider] Failed to load schema context for generating SQL:", err.message);
    }

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are an expert SQL generation assistant. Translate the given natural language prompt into a single, syntactically correct SQL query. " +
            "Do not wrap your output in markdown code blocks (like ```sql ... ```). " +
            "Do not include any explanations, comments, HTML tags, or introductory text. " +
            "Return ONLY the raw SQL statement." +
            (schemaContext ? `\n\n${schemaContext}` : ""),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.0,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Received empty response from OpenRouter API.");
    }

    // Extract SQL query securely using the statement-aware parser
    const sql = extractSQLFromResponse(responseText);

    return { sql };
  }

  /**
   * Explains query steps using OpenRouter.
   * @param {string} sql
   * @param {string} [sessionId=null]
   * @returns {Promise<string[]>}
   */
  async explainSQL(sql, sessionId = null) {
    const modelName = process.env.MODEL_NAME;
    
    if (!modelName || modelName.trim() === "") {
      throw new Error("MODEL_NAME is not configured in the environment variables.");
    }

    if (!openai.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in the environment variables.");
    }

    let schemaContext = "";
    try {
      const schema = await getDatabaseSchema(sessionId);
      schemaContext = buildSchemaContext(sql, schema);
    } catch (err) {
      console.warn("[OpenRouterProvider] Failed to load schema context for explaining SQL:", err.message);
    }

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
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
            "Return ONLY the raw JSON text." +
            (schemaContext ? `\n\n${schemaContext}` : ""),
        },
        {
          role: "user",
          content: sql,
        },
      ],
      temperature: 0.0,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Received empty response from OpenRouter API.");
    }

    let cleanText = cleanAIResponse(responseText);
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }
    cleanText = cleanText.trim();

    const explanationArray = JSON.parse(cleanText);

    if (!Array.isArray(explanationArray)) {
      throw new Error("Parsed response is not a JSON array.");
    }

    return explanationArray;
  }

  /**
   * Analyzes query tables, risks, and estimated rows using OpenRouter.
   * @param {string} sql
   * @param {string} [sessionId=null]
   * @returns {Promise<{ riskLevel: string, rowsAffected: number, rowsReturned: number, tables: string[], warnings: string[] }>}
   */
  async analyzeQueryImpact(sql, sessionId = null) {
    const modelName = process.env.MODEL_NAME;
    
    if (!modelName || modelName.trim() === "") {
      throw new Error("MODEL_NAME is not configured in the environment variables.");
    }

    if (!openai.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in the environment variables.");
    }

    let schemaContext = "";
    try {
      const schema = await getDatabaseSchema(sessionId);
      schemaContext = buildSchemaContext(sql, schema);
    } catch (err) {
      console.warn("[OpenRouterProvider] Failed to load schema context for impact analysis:", err.message);
    }

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
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
            "Return ONLY the raw JSON text." +
            (schemaContext ? `\n\n${schemaContext}` : ""),
        },
        {
          role: "user",
          content: sql,
        },
      ],
      temperature: 0.0,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Received empty response from OpenRouter API.");
    }

    let cleanText = cleanAIResponse(responseText);
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }
    cleanText = cleanText.trim();

    const analysisObj = JSON.parse(cleanText);

    return {
      riskLevel: analysisObj.riskLevel || "LOW",
      rowsAffected: typeof analysisObj.rowsAffected === "number" ? analysisObj.rowsAffected : 0,
      rowsReturned: typeof analysisObj.rowsReturned === "number" ? analysisObj.rowsReturned : 0,
      tables: Array.isArray(analysisObj.tables) ? analysisObj.tables : [],
      warnings: Array.isArray(analysisObj.warnings) ? analysisObj.warnings : ["No warnings generated."],
    };
  }

  /**
   * Suggests optimization parameters using OpenRouter.
   * @param {string} sql
   * @param {string} [sessionId=null]
   * @returns {Promise<{ optimizedSql: string, explanation: string }>}
   */
  async optimizeSQL(sql, sessionId = null) {
    const modelName = process.env.MODEL_NAME;
    
    if (!modelName || modelName.trim() === "") {
      throw new Error("MODEL_NAME is not configured in the environment variables.");
    }

    if (!openai.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in the environment variables.");
    }

    let schemaContext = "";
    try {
      const schema = await getDatabaseSchema(sessionId);
      schemaContext = buildSchemaContext(sql, schema);
    } catch (err) {
      console.warn("[OpenRouterProvider] Failed to load schema context for optimizing SQL:", err.message);
    }

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are an expert SQL optimization assistant. " +
            "Analyze the provided SQL query and optimize it for performance (e.g. adding index hints, rewriting subqueries to JOINs, simplifying clauses). " +
            "Return the response ONLY as a valid JSON object with two keys: 'optimizedSql' (string) and 'explanation' (string). " +
            "Do not wrap your output in markdown code blocks (like ```json ... ```). " +
            "Return ONLY the raw JSON text." +
            (schemaContext ? `\n\n${schemaContext}` : ""),
        },
        {
          role: "user",
          content: sql,
        },
      ],
      temperature: 0.0,
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Received empty response from OpenRouter API.");
    }

    let cleanText = cleanAIResponse(responseText);
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(json)?\n?/i, "").replace(/\n?```$/, "");
    }
    cleanText = cleanText.trim();

    const optimizationData = JSON.parse(cleanText);

    if (!optimizationData.optimizedSql || !optimizationData.explanation) {
      throw new Error("Parsed response is missing optimizedSql or explanation fields.");
    }

    return optimizationData;
  }
}
