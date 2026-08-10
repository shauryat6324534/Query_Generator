import { OpenRouterProvider } from "./openRouterProvider.js";

/**
 * Factory function to retrieve the configured AI provider instance.
 * Ensures the service layer depends only on the abstraction.
 * 
 * @returns {import("./aiProvider.js").AIProvider}
 */
export const getAIProvider = () => {
  return new OpenRouterProvider();
};
