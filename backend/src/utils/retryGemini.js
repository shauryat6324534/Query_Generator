/**
 * Helper to retry a transient Gemini API call with exponential backoff and jitter.
 * @param {Function} apiCallFn - Async function wrapping the Gemini API call.
 * @returns {Promise<any>} Response from the API call.
 */
export const retryGemini = async (apiCallFn) => {
  const maxRetries = 3;
  const initialDelay = 1000; // 1 second

  const isTransientError = (error) => {
    if (!error) return false;
    const status = error.status || error.statusCode || (error.response && error.response.status);
    if (status === 429 || status === 503) {
      return true;
    }
    const errMsg = String(error.message || error).toLowerCase();
    return (
      errMsg.includes("429") ||
      errMsg.includes("503") ||
      errMsg.includes("resourceexhausted") ||
      errMsg.includes("service unavailable") ||
      errMsg.includes("serviceunavailable") ||
      errMsg.includes("high demand")
    );
  };

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCallFn();
    } catch (error) {
      lastError = error;

      // If we've reached the maximum number of retries, or it's not a transient error, throw immediately
      if (attempt === maxRetries || !isTransientError(error)) {
        throw error;
      }

      // Calculate exponential backoff: Attempt 1 -> 1s, Attempt 2 -> 2s, Attempt 3 -> 4s
      // attempt = 0: delay = 1000 * 2^0 = 1000 ms
      // attempt = 1: delay = 1000 * 2^1 = 2000 ms
      // attempt = 2: delay = 1000 * 2^2 = 4000 ms
      const backoffDelay = initialDelay * Math.pow(2, attempt);
      
      // Add random jitter between 0 and 200ms
      const jitter = Math.random() * 200;
      const totalDelay = backoffDelay + jitter;

      console.warn(
        `[retryGemini] Gemini API call failed with a transient error. Attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${Math.round(totalDelay)}ms... Error: ${error.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
};
