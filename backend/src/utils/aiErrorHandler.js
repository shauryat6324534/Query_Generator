/**
 * Helper utility to inspect errors thrown by the AI provider (OpenRouter/OpenAI SDK)
 * and respond with the correct HTTP status code and user-friendly error message.
 * 
 * @param {Error} error The caught error
 * @param {object} res The Express response object
 * @param {string} [actionName="AI request"] The name of the action being performed (e.g. "generation")
 */
export const handleAIError = (error, res, actionName = "AI request") => {
  console.error(`[aiErrorHandler] Error during ${actionName}:`, error);

  const errorMessage = error?.message?.toLowerCase() || "";
  const status = error?.status || error?.statusCode || (error?.response && error?.response?.status);

  // 1. Authentication / Authorization (401 / 403)
  if (
    status === 401 ||
    errorMessage.includes("401") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("invalid authentication") ||
    errorMessage.includes("key is not configured") ||
    errorMessage.includes("openrouter_api_key")
  ) {
    return res.status(401).json({
      error: "OpenRouter API key is invalid or unauthorized. Please verify your OPENROUTER_API_KEY environment variable in the backend/.env file."
    });
  }

  if (
    status === 403 ||
    errorMessage.includes("403") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("blocked")
  ) {
    return res.status(403).json({
      error: "Access blocked or denied to the OpenRouter API. Please check your API key permissions and API billing/limits."
    });
  }

  // 2. Quota / Rate Limits (429)
  if (
    status === 429 ||
    errorMessage.includes("429") ||
    errorMessage.includes("quota") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("resourceexhausted")
  ) {
    return res.status(429).json({
      error: `AI ${actionName} quota exceeded. Please try again later.`
    });
  }

  // 3. Network / Service Availability (503)
  if (
    status === 503 ||
    errorMessage.includes("503") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("service unavailable")
  ) {
    return res.status(503).json({
      error: `Unable to connect to the AI ${actionName} service. Please try again later.`
    });
  }

  // 4. Default Fallback (500)
  return res.status(500).json({
    error: `AI ${actionName} service is temporarily unavailable. Please try again later.`
  });
};
