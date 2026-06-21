import pool, { checkConnection } from "../database/db.js";

/**
 * Service to retrieve database schema (tables and columns) from MySQL.
 * Responsibility: Query INFORMATION_SCHEMA to list structure metadata.
 */

/**
 * Fetches all tables and columns from the connected database.
 * @returns {Promise<Array<{ tableName: string, columns: Array<{ columnName: string, dataType: string, isPrimaryKey: boolean, isNullable: boolean }> }>>}
 */
export const getDatabaseSchema = async () => {
  const databaseName = process.env.DB_NAME;

  if (!databaseName) {
    throw new Error(
      "DB_NAME is not configured in the environment variables. Please check your backend/.env file."
    );
  }

  // Ensure DB connection is active before querying
  await checkConnection();

  try {
    const query = `
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        DATA_TYPE, 
        COLUMN_KEY, 
        IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME, ORDINAL_POSITION;
    `;

    const [rows] = await pool.query(query, [databaseName]);

    // Group columns by their respective tables
    const tableMap = {};

    rows.forEach((row) => {
      const { TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY, IS_NULLABLE } = row;

      if (!tableMap[TABLE_NAME]) {
        tableMap[TABLE_NAME] = {
          tableName: TABLE_NAME,
          columns: [],
        };
      }

      tableMap[TABLE_NAME].columns.push({
        columnName: COLUMN_NAME,
        dataType: DATA_TYPE,
        isPrimaryKey: COLUMN_KEY === "PRI",
        isNullable: IS_NULLABLE === "YES",
      });
    });

    return Object.values(tableMap);
  } catch (error) {
    console.error("[schemaService] Failed to read database schema:", error);
    throw new Error(`Database schema extraction failed: ${error.message}`);
  }
};
