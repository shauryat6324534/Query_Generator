import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { checkConnection, createSessionPool, destroySessionPool, getSessionEntry } from "./database/db.js";
import healthRouter from "./routes/health.js";
import queryRouter from "./routes/query.js";
import explainRouter from "./routes/explain.js";
import impactRouter from "./routes/impact.js";
import executeRouter from "./routes/execute.js";
import historyRouter from "./routes/history.js";
import exportRouter from "./routes/export.js";
import schemaRouter from "./routes/schema.js";
import optimizeRouter from "./routes/optimize.js";
import authRouter from "./routes/auth.js";

// Middleware & Utilities
import { authMiddleware } from "./middleware/authMiddleware.js";
import { csrfMiddleware } from "./middleware/csrfMiddleware.js";
import { generalLimiter, strictLimiter } from "./middleware/rateLimiter.js";
import { validateAndResolveHost } from "./utils/ssrfValidator.js";
import { validatePort } from "./utils/portValidator.js";

// Load environment variables
dotenv.config();

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("Fatal: JWT_SECRET environment variable is required in production.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Environment-based CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.FRONTEND_URL;
    if (!origin || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else if (origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS policy."));
    }
  },
  credentials: true
};

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "50kb" })); // Protect against oversized payloads
app.use(generalLimiter); // Apply general rate limit to all requests

// MySQL connection error translation helper
const translateConnectionError = (error) => {
  const code = error.code;
  const message = error.message || "";
  
  if (code === "ER_ACCESS_DENIED_ERROR" || error.errno === 1045) {
    return "Access denied: Invalid database username or password.";
  }
  if (code === "ER_BAD_DB_ERROR" || error.errno === 1049) {
    return "Database not found: The database name you specified does not exist.";
  }
  if (["ENOTFOUND", "ETIMEDOUT", "ECONNREFUSED"].includes(code)) {
    return "Host unreachable: Could not connect to the database server at the specified host and port.";
  }
  return `Connection failed: ${message}`;
};



// Unprotected API routes (Auth & Health)
app.use("/auth", authRouter);
app.use("/health", healthRouter);

// CSRF Protection double-submit cookie validation (Applies to all POST/PUT/DELETE requests below)
app.use(csrfMiddleware);

// Database Session Connection REST APIs (Protected)
app.post("/database/connect", authMiddleware, strictLimiter, async (req, res) => {
  const { host, port, user, password, database } = req.body;
  const userId = req.user.userId;

  if (!host || !user || !database) {
    return res.status(400).json({ error: "Host, User, and Database Name are required." });
  }

  // Validate port if provided
  try {
    validatePort(port);
  } catch (portErr) {
    return res.status(400).json({ error: portErr.message });
  }

  // SSRF DNS resolution and validation
  let resolvedHost;
  try {
    resolvedHost = await validateAndResolveHost(host);
  } catch (ssrfErr) {
    return res.status(400).json({ error: ssrfErr.message });
  }

  try {
    const sessionId = await createSessionPool({
      host: resolvedHost,
      port: parseInt(port || "3306", 10),
      user,
      password: password || "",
      database,
    }, userId);
    return res.status(200).json({ sessionId, database });
  } catch (error) {
    return res.status(500).json({ error: translateConnectionError(error) });
  }
});

app.post("/database/test", authMiddleware, strictLimiter, async (req, res) => {
  const { host, port, user, password, database } = req.body;
  
  if (!host || !user || !database) {
    return res.status(400).json({ error: "Host, User, and Database Name are required." });
  }

  // Validate port if provided
  try {
    validatePort(port);
  } catch (portErr) {
    return res.status(400).json({ error: portErr.message });
  }

  // SSRF DNS resolution and validation
  let resolvedHost;
  try {
    resolvedHost = await validateAndResolveHost(host);
  } catch (ssrfErr) {
    return res.status(400).json({ error: ssrfErr.message });
  }

  try {
    const tempPool = mysql.createPool({
      host: resolvedHost,
      port: parseInt(port || "3306", 10),
      user,
      password: password || "",
      database,
      connectionLimit: 1,
    });
    const conn = await tempPool.getConnection();
    conn.release();
    await tempPool.end();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: translateConnectionError(error) });
  }
});

app.post("/database/disconnect", authMiddleware, async (req, res) => {
  const sessionId = req.headers["x-session-id"];
  const userId = req.user.userId;
  
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  try {
    const session = getSessionEntry(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: "Access denied: Invalid database session or ownership mismatch." });
    }
    
    await destroySessionPool(sessionId);
    return res.status(200).json({ message: "Disconnected successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Mounting database schema route with app.use to resolve Express routing bug (404 schema offline)
app.use("/database/schema", authMiddleware, schemaRouter);

// Protected API routes
app.use("/generate-query", authMiddleware, queryRouter);
app.use("/explain-query", authMiddleware, explainRouter);
app.use("/analyze-impact", authMiddleware, impactRouter);
app.use("/execute-query", authMiddleware, executeRouter);
app.use("/history", authMiddleware, historyRouter);
app.use("/export-csv", authMiddleware, exportRouter);
app.use("/schema", authMiddleware, schemaRouter);
app.use("/optimize-query", authMiddleware, optimizeRouter);

// Root route welcome message
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AI SQL Query Generator API" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  try {
    await checkConnection();
    console.log("[Database] Connection verified successfully on startup.");
  } catch (error) {
    console.error("[Database] Connection failed on startup:", error.message);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log("[Server] HTTP server closed.");
    });
  }
  
  // Close default pool
  const { defaultPool } = await import("./database/db.js");
  if (defaultPool) {
    console.log("[Server] Closing default database pool...");
    try {
      await defaultPool.end();
      console.log("[Server] Default database pool closed.");
    } catch (err) {
      console.error("[Server] Error closing default database pool:", err);
    }
  }

  // Close dynamic pools
  const { sessionPools } = await import("./database/db.js");
  for (const [sessionId, entry] of sessionPools.entries()) {
    console.log(`[Server] Ending pool for session ${sessionId}...`);
    try {
      await entry.pool.end();
    } catch (err) {
      console.error(`[Server] Error ending pool ${sessionId}:`, err.message);
    }
  }

  console.log("[Server] Graceful shutdown completed. Exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
