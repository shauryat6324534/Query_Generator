/**
 * Service to serialize SQL query results into formatted CSV strings.
 * Responsibility: Accept array of row objects, format cells, escape special characters, and return CSV block.
 */

/**
 * Escapes a single cell value for CSV formatting following RFC 4180.
 * @param {any} val The value to escape
 * @returns {string} The escaped cell value
 */
const escapeValue = (val) => {
  if (val === null || val === undefined) {
    return "";
  }

  const strValue = String(val);

  // Check if string contains special characters: comma, double quotes, newline, carriage return
  const hasComma = strValue.includes(",");
  const hasQuotes = strValue.includes('"');
  const hasNewline = strValue.includes("\n");
  const hasCarriageReturn = strValue.includes("\r");

  if (hasComma || hasQuotes || hasNewline || hasCarriageReturn) {
    // Escape double quotes by doubling them, then wrap the entire field in double quotes
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
};

/**
 * Converts an array of query result objects to a valid CSV string.
 * @param {Array<object>} data Array of database row objects
 * @returns {Promise<string>} The formatted CSV file content
 */
export const convertToCSV = async (data) => {
  if (!data) {
    return "";
  }

  if (!Array.isArray(data)) {
    throw new Error("Input data must be an array of objects.");
  }

  if (data.length === 0) {
    return "";
  }

  try {
    // Extract headers from keys of the first row object
    const headers = Object.keys(data[0]);
    const headerRow = headers.map((header) => escapeValue(header)).join(",");

    // Build row lines
    const bodyRows = data.map((row) => {
      return headers
        .map((header) => {
          const val = row[header];
          return escapeValue(val);
        })
        .join(",");
    });

    // Combine headers and body rows
    return [headerRow, ...bodyRows].join("\n");
  } catch (error) {
    console.error("[exportService] Failed to generate CSV:", error);
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};
