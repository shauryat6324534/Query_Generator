const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Pings the backend health endpoint.
 * @returns {Promise<{ status: string }>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to reach backend server");
  }
};
