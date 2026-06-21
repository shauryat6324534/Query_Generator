import mysql from "mysql2/promise";
import dotenv from "dotenv";

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

// Create a connection pool to share between schema and query executors
const pool = mysql.createPool(dbConfig);

// Helper to check database connectivity
export const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("[Database] Connectivity check failed:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default pool;
