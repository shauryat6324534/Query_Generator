import crypto from "crypto";
import { defaultPool } from "../database/db.js";
import { hashPassword, verifyPassword, signToken } from "../utils/cryptoUtils.js";

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Initializes the users database table if not exists.
 */
export const initUsersTable = async () => {
  try {
    await defaultPool.query(CREATE_USERS_TABLE);
  } catch (err) {
    console.error("[authController] Users table initialization failed:", err.message);
  }
};

/**
 * Register a new user account.
 */
export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long." });
  }
  
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const cleanUsername = username.trim().toLowerCase();
  
  // Basic alphanumeric check
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: "Username can only contain alphanumeric characters and underscores." });
  }

  try {
    await initUsersTable();

    // Check check username duplication
    const [existing] = await defaultPool.query("SELECT id FROM users WHERE username = ?", [cleanUsername]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const hashedPassword = hashPassword(password);
    await defaultPool.query("INSERT INTO users (username, password) VALUES (?, ?)", [cleanUsername, hashedPassword]);

    return res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("[authController] Registration error:", error);
    return res.status(500).json({ error: "Failed to register user due to an internal error." });
  }
};

/**
 * Login user and issue HttpOnly authentication and CSRF cookies.
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    await initUsersTable();

    // Fetch user details
    const [users] = await defaultPool.query("SELECT * FROM users WHERE username = ?", [cleanUsername]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = users[0];
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Sign authentication token
    const secret = process.env.JWT_SECRET || "fallback_default_jwt_secret_key_32_chars";
    const token = signToken({ userId: user.id, username: user.username }, secret, 24 * 60 * 60);

    // Generate random CSRF token
    const csrfToken = crypto.randomBytes(24).toString("hex");

    // Set HttpOnly auth token cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Set client-accessible CSRF cookie
    res.cookie("_csrf", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      success: true,
      user: {
        userId: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error("[authController] Login error:", error);
    return res.status(500).json({ error: "Failed to authenticate user due to an internal error." });
  }
};

/**
 * Logout user and clear all cookies.
 */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  
  res.clearCookie("_csrf", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

/**
 * Retrieves current active authenticated session user details.
 */
export const me = (req, res) => {
  // If request passed authMiddleware, req.user will be populated
  
  // Refresh CSRF token on me checks
  const csrfToken = crypto.randomBytes(24).toString("hex");
  res.cookie("_csrf", csrfToken, {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    success: true,
    user: req.user
  });
};
