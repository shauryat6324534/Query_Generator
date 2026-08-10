import { verifyToken } from "../utils/cryptoUtils.js";

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
 * Authentication guardian middleware.
 * Verifies signed JWT token from HttpOnly cookies and registers identity in req.user.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Access denied: User is unauthenticated." });
    }

    const secret = process.env.JWT_SECRET || "fallback_default_jwt_secret_key_32_chars";
    const decoded = verifyToken(token, secret);

    if (!decoded) {
      return res.status(401).json({ error: "Access denied: Session has expired or token is invalid." });
    }

    // Strictly register authenticated user identity
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (error) {
    console.error("[authMiddleware] Error:", error.message);
    return res.status(500).json({ error: "Internal authentication handler error." });
  }
};
