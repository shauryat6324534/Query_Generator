import { hashPassword, verifyPassword, signToken, verifyToken } from "./src/utils/cryptoUtils.js";
import { validateAndResolveHost } from "./src/utils/ssrfValidator.js";
import { validateSQLSafety } from "./src/utils/sqlSafety.js";

async function runTests() {
  console.log("=== SECURITY HARDENING INTEGRITY TEST MATRIX ===\n");
  let passCount = 0;
  let failCount = 0;

  const assert = (name, condition) => {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name}`);
      failCount++;
    }
  };

  // 1. Authentication & Token Signing Checks
  try {
    const secret = "test_jwt_secret_must_be_long_and_secure_key";
    const token = signToken({ userId: 42, username: "alice" }, secret, 2); // 2 seconds expiry
    
    // Verify valid token
    const decoded = verifyToken(token, secret);
    assert("Token verification - valid payload", decoded && decoded.userId === 42 && decoded.username === "alice");
    
    // Verify expired token (wait 3 seconds)
    await new Promise(r => setTimeout(r, 3000));
    const expiredDecoded = verifyToken(token, secret);
    assert("Token verification - expired token rejected", expiredDecoded === null);

    // Verify invalid signature
    const badToken = token + "corrupted";
    const badDecoded = verifyToken(badToken, secret);
    assert("Token verification - bad signature rejected", badDecoded === null);
  } catch (err) {
    console.error("Token test error:", err);
    failCount++;
  }

  // 2. Password Hashing Checks
  try {
    const pw = "SuperSecurePassword123!";
    const hashed = hashPassword(pw);
    
    assert("Password hashing - salt:hash format generated", hashed && hashed.includes(":") && hashed.split(":")[0].length === 32);
    assert("Password verification - correct password match", verifyPassword(pw, hashed) === true);
    assert("Password verification - incorrect password mismatch", verifyPassword("wrong_password", hashed) === false);
  } catch (err) {
    console.error("Password test error:", err);
    failCount++;
  }

  // 3. SSRF Protection Checks
  const ssrfCases = [
    { host: "localhost", expectedBlocked: true },
    { host: "127.0.0.1", expectedBlocked: true },
    { host: "10.0.0.1", expectedBlocked: true },
    { host: "192.168.1.100", expectedBlocked: true },
    { host: "169.254.169.254", expectedBlocked: true },
    { host: "::1", expectedBlocked: true },
    { host: "google.com", expectedBlocked: false }
  ];

  for (const tc of ssrfCases) {
    try {
      const ip = await validateAndResolveHost(tc.host);
      assert(`SSRF - host '${tc.host}' resolved to ${ip} (Allowed)`, !tc.expectedBlocked);
    } catch (err) {
      assert(`SSRF - host '${tc.host}' rejected: ${err.message} (Blocked)`, tc.expectedBlocked);
    }
  }

  // 4. SQL Safety Checker checks
  const sqlCases = [
    // Destructive
    { sql: "DROP TABLE users;", expectedBlocked: true },
    { sql: "drop table users;", expectedBlocked: true },
    { sql: "DROP /*comment*/ TABLE users;", expectedBlocked: true },
    { sql: "TRUNCATE TABLE logs;", expectedBlocked: true },
    { sql: "ALTER TABLE users ADD COLUMN role VARCHAR(50);", expectedBlocked: true },
    { sql: "CREATE DATABASE test_db;", expectedBlocked: true },
    { sql: "GRANT ALL PRIVILEGES ON *.* TO 'malicious'@'%';", expectedBlocked: true },
    { sql: "REVOKE ALL ON db.* FROM 'user';", expectedBlocked: true },
    { sql: "SET GLOBAL general_log = 'ON';", expectedBlocked: true },
    // Multi-statement
    { sql: "SELECT 1; DROP TABLE users;", expectedBlocked: true },
    { sql: "SELECT 1; SELECT 2;", expectedBlocked: true },
    // Filesystem
    { sql: "LOAD DATA INFILE 'secrets.txt' INTO TABLE dump;", expectedBlocked: true },
    { sql: "SELECT * FROM users INTO OUTFILE '/tmp/dump.txt';", expectedBlocked: true },
    // UPDATE/DELETE without WHERE
    { sql: "DELETE FROM users;", expectedBlocked: true },
    { sql: "UPDATE users SET role = 'admin';", expectedBlocked: true },
    // Safe statements
    { sql: "SELECT * FROM employees WHERE id = 10;", expectedBlocked: false },
    { sql: "SELECT employee_id, name FROM employees;", expectedBlocked: false },
    { sql: "DELETE FROM query_history WHERE user_id = 5;", expectedBlocked: false },
    { sql: "UPDATE users SET password = 'abc' WHERE id = 1;", expectedBlocked: false }
  ];

  for (const tc of sqlCases) {
    try {
      validateSQLSafety(tc.sql);
      assert(`SQL Safety - query '${tc.sql}' is Allowed`, !tc.expectedBlocked);
    } catch (err) {
      assert(`SQL Safety - query '${tc.sql}' is Blocked (${err.message})`, tc.expectedBlocked);
    }
  }

  console.log(`\n=== TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
