const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    cookies[name] = decodeURIComponent(value);
  });
  return cookies;
};

/**
 * Cross-Site Request Forgery (CSRF) Protection Middleware.
 * Implements the Double-Submit Cookie pattern for state-changing operations.
 */
export const csrfMiddleware = (req, res, next) => {
  // 1. Safe methods (GET, HEAD, OPTIONS) do not require CSRF validation
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  try {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    
    const cookieCsrfToken = cookies._csrf;
    const headerCsrfToken = req.headers["x-csrf-token"];

    if (!cookieCsrfToken || !headerCsrfToken || cookieCsrfToken !== headerCsrfToken) {
      console.warn(`[csrfMiddleware] Blocked request from IP ${req.ip} - CSRF mismatch. Method: ${req.method}, Path: ${req.path}`);
      return res.status(403).json({ error: "Access denied: Invalid or missing CSRF token." });
    }

    next();
  } catch (error) {
    console.error("[csrfMiddleware] Error:", error.message);
    return res.status(500).json({ error: "Internal CSRF handler error." });
  }
};
