import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
};

async function debugHistory() {
  console.log("Database Connection Diagnostics:");
  console.log("- Host:", dbConfig.host);
  console.log("- Port:", dbConfig.port);
  console.log("- User:", dbConfig.user);
  console.log("- Database:", dbConfig.database);
  console.log("- Password Configured:", dbConfig.password ? "YES" : "NO");

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("\nConnection check: SUCCESS!");
    
    console.log("Running history query...");
    const [rows] = await connection.query("SELECT * FROM query_history;");
    console.log("History Query Check: SUCCESS!");
    console.log("Rows returned:", rows.length);
    console.log("Rows:", JSON.stringify(rows, null, 2));
    
    await connection.end();
  } catch (error) {
    console.log("\n--- MySQL Connection / Query Error ---");
    console.log("- Error Message:", error.message || "(none)");
    console.log("- Error Code:", error.code || "(none)");
    console.log("- Error Errno:", error.errno || "(none)");
    console.log("- SQL Message:", error.sqlMessage || "(none)");
    console.log("- SQL State:", error.sqlState || "(none)");
    console.log("- Stack Trace:", error.stack);
    console.log("--------------------------------------");
  }
}

debugHistory();
