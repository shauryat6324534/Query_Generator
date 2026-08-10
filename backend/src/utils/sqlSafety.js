/**
 * Utility to validate SQL statements for safety and prevent destructive operations,
 * stacked queries, and unauthorized operations.
 */

/**
 * Validates a SQL statement for safety.
 * Throws an Error if safety checks are violated.
 * @param {string} sql The SQL query to check
 * @returns {boolean} True if safe
 */
export const validateSQLSafety = (sql) => {
  if (!sql || typeof sql !== "string") {
    throw new Error("Invalid SQL statement type.");
  }

  const trimmedSql = sql.trim();
  if (trimmedSql === "") {
    throw new Error("Empty SQL query is not allowed.");
  }

  // 1. Remove comments and string literals safely to prevent bypasses and false positives
  // Replace block comments, line comments, and strings with single spaces to keep word boundaries
  let cleanSql = trimmedSql
    .replace(/\/\*[\s\S]*?\*\//g, " ") // block comments /* ... */
    .replace(/--.*$/gm, " ")          // line comments -- ...
    .replace(/#[^\n]*\n/g, " ")       // MySQL hash comments # ...
    .replace(/'[^']*'/g, " 'string' ") // single-quoted strings
    .replace(/"[^"]*"/g, ' "string" ') // double-quoted strings
    .replace(/`[^`]*`/g, " `identifier` "); // backtick-quoted identifiers

  // 2. Check for stacked statements / query stacking (multiple statements using semicolons)
  // Clean all whitespace
  cleanSql = cleanSql.replace(/\s+/g, " ").trim();
  
  if (cleanSql.includes(";")) {
    const semicolonIdx = cleanSql.indexOf(";");
    const lastSemicolonIdx = cleanSql.lastIndexOf(";");
    
    // Semicolon is only allowed if it is the very last non-whitespace character in the query
    if (semicolonIdx !== lastSemicolonIdx || semicolonIdx < cleanSql.length - 1) {
      throw new Error("Multiple stacked statements are blocked for safety reasons.");
    }
  }

  // 3. Tokenize by splitting on spaces and normalize to uppercase
  const tokens = cleanSql
    .toUpperCase()
    .split(/\s+/)
    .map(t => t.replace(/[^A-Z_]/g, "")); // strip punctuation but keep letters and underscores

  // 4. Block destructive and database-level operations
  const blockedOperations = [
    "DROP",
    "TRUNCATE",
    "ALTER",
    "GRANT",
    "REVOKE",
    "SHUTDOWN",
    "RENAME"
  ];

  // Specific check for SET GLOBAL (regular SET might be okay, but SET GLOBAL/SET SESSION is restricted)
  if (tokens.includes("SET") && (tokens.includes("GLOBAL") || tokens.includes("SESSION"))) {
    throw new Error("Query blocked for safety reasons: database system configuration modifications are restricted.");
  }

  for (const token of tokens) {
    if (blockedOperations.includes(token)) {
      throw new Error("Query blocked for safety reasons: destructive operations are restricted.");
    }
  }

  // CREATE is blocked unless it is creating a temporary table or database-neutral operation,
  // but for query execution safety, CREATE DATABASE, CREATE USER, CREATE TABLE are all blocked.
  if (tokens.includes("CREATE")) {
    throw new Error("Query blocked for safety reasons: schema modification (CREATE) operations are restricted.");
  }

  // 5. Block filesystem and data export/load operations
  const normalizedSql = cleanSql.toUpperCase();
  if (
    normalizedSql.includes("LOAD DATA") || 
    normalizedSql.includes("INTO OUTFILE") || 
    normalizedSql.includes("INTO DUMPFILE")
  ) {
    throw new Error("Query blocked for safety reasons: database file system import/export operations are restricted.");
  }

  // 6. Ensure UPDATE and DELETE queries contain a WHERE clause
  if (tokens.includes("UPDATE") || tokens.includes("DELETE")) {
    if (!tokens.includes("WHERE")) {
      throw new Error("Query blocked for safety reasons: UPDATE and DELETE statements must contain a WHERE clause to prevent accidental mass mutations.");
    }
  }

  return true;
};
