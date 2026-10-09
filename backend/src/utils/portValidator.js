/**
 * Validates a port number for database connection requests.
 * @param {any} port 
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
export const validatePort = (port) => {
  if (port === undefined || port === null || port === "") {
    return true;
  }
  const portStr = String(port).trim();
  if (!/^\d+$/.test(portStr)) {
    throw new Error("Invalid port: Port must be a positive integer.");
  }
  const portNum = parseInt(portStr, 10);
  if (portNum < 1 || portNum > 65535) {
    throw new Error("Invalid port: Port must be between 1 and 65535.");
  }
  return true;
};
