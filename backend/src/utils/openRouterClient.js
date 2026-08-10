import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const hasApiKey = apiKey && apiKey !== "your_openrouter_api_key_here" && apiKey.trim() !== "";

export const openai = new OpenAI({
  baseURL,
  apiKey: hasApiKey ? apiKey : "",
  maxRetries: 1, // Maximum of 1 retry
  timeout: 15000, // 15 seconds timeout
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost:5000",
    "X-Title": process.env.OPENROUTER_APP_NAME || "AI SQL Query Generator",
  }
});
