import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Ensure environment variables are loaded (backup check)
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a default connection pool to share between schema and query executors
const defaultPool = mysql.createPool(dbConfig);
export const sessionPools = new Map(); // Key: sessionId, Value: { pool, lastActive: number, database: string, userId: number }

// Retrieves a specific database connection session entry
export const getSessionEntry = (sessionId) => {
  if (sessionId && sessionPools.has(sessionId)) {
    return sessionPools.get(sessionId);
  }
  return null;
};

// Session Pool Accessor with activity tracking
export const getPoolForSession = (sessionId) => {
  if (sessionId && sessionPools.has(sessionId)) {
    const entry = sessionPools.get(sessionId);
    entry.lastActive = Date.now();
    return entry.pool;
  }
  return defaultPool;
};

// Retrieve active database name for session
export const getDatabaseNameForSession = (sessionId) => {
  if (sessionId && sessionPools.has(sessionId)) {
    const entry = sessionPools.get(sessionId);
    entry.lastActive = Date.now();
    return entry.database;
  }
  return dbConfig.database;
};

// Create dynamic connection pool for custom credentials
export const createSessionPool = async (config, userId) => {
  const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  // Verify connection by getting one and releasing
  const conn = await pool.getConnection();
  conn.release();

  const sessionId = uuidv4();
  sessionPools.set(sessionId, {
    pool,
    lastActive: Date.now(),
    database: config.database,
    userId: userId // Bind pool to authenticated user ID
  });
  return sessionId;
};

// Close and delete custom connection pool
export const destroySessionPool = async (sessionId) => {
  if (sessionId && sessionPools.has(sessionId)) {
    const entry = sessionPools.get(sessionId);
    await entry.pool.end();
    sessionPools.delete(sessionId);
  }
};

// Helper to check default database connectivity
export const checkConnection = async () => {
  try {
    const connection = await defaultPool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("[Database] Connectivity check failed:");
    console.error(`- Message: ${error.message}`);
    console.error(`- Code: ${error.code}`);
    console.error(`- Errno: ${error.errno}`);
    console.error(`- SQL Message: ${error.sqlMessage}`);
    console.error(`- SQL State: ${error.sqlState}`);
    console.error("- Stack Trace:", error.stack);
    
    // Throw the original error directly to preserve stack traces
    throw error;
  }
};

// Automatic cleanup task for idle sessions (runs every 5 minutes, 30 min idle threshold)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_IDLE_AGE_MS = 30 * 60 * 1000;

setInterval(async () => {
  const now = Date.now();
  for (const [sessionId, entry] of sessionPools.entries()) {
    if (now - entry.lastActive > MAX_IDLE_AGE_MS) {
      console.log(`[Session Cleanup] Ending idle connection session: ${sessionId}`);
      try {
        await entry.pool.end();
      } catch (err) {
        console.error(`[Session Cleanup] Error ending idle pool ${sessionId}:`, err);
      }
      sessionPools.delete(sessionId);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

export { defaultPool };
export default defaultPool;

