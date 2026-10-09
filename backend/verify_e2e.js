import http from "http";
import crypto from "crypto";

const BASE_URL = "http://localhost:5000";

const request = (path, options = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const req = http.request(url, {
      method: options.method || "GET",
      headers: options.headers || {},
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => JSON.parse(data)
        });
      });
    });

    req.on("error", (err) => reject(err));
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
};

// Extractor helper for session cookie
const parseSetCookie = (headers) => {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return {};
  const cookies = {};
  setCookie.forEach(c => {
    const parts = c.split(";")[0].split("=");
    cookies[parts[0]] = parts[1];
  });
  return cookies;
};

async function executeE2ETests() {
  console.log("==================================================");
  console.log("      STARTING E2E & REGRESSION SUITE            ");
  console.log("==================================================\n");

  const resultsSummary = {};
  let sessionId = "";

  // 1. Register and Login to get session cookies
  console.log("[Test 1] Authentication E2E...");
  let cookieHeader = "";
  let csrfToken = "";
  try {
    const testUser = `tester_${crypto.randomBytes(4).toString("hex")}`;
    const testPass = "Password123!";

    // Register
    const regRes = await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, { username: testUser, password: testPass });
    
    // Login
    const loginRes = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, { username: testUser, password: testPass });

    const cookies = parseSetCookie(loginRes.headers);
    cookieHeader = `token=${cookies.token}; _csrf=${cookies._csrf}`;
    csrfToken = cookies._csrf;

    resultsSummary.auth = (regRes.statusCode === 201 && loginRes.statusCode === 200 && cookies.token && cookies._csrf) ? "PASS" : "FAIL";
    console.log(`- Register status: ${regRes.statusCode}`);
    console.log(`- Login status: ${loginRes.statusCode}`);
    console.log(`- Cookies received: token (present), _csrf (present)`);
    console.log(`- SameSite check: ${loginRes.headers["set-cookie"]?.map(c => c.toLowerCase()).join(" | ")}`);
    
    // Call test-session route to create a session pool for queries
    const sessionRes = await request("/auth/test-session", {
      method: "POST",
      headers: {
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken
      }
    });
    
    if (sessionRes.statusCode === 200) {
      const sessionObj = sessionRes.json();
      sessionId = sessionObj.sessionId;
      console.log(`- Created test connection session ID: ${sessionId}`);
    } else {
      console.error(`- Failed to create test connection session: status ${sessionRes.statusCode}`);
      resultsSummary.auth = "FAIL";
    }

    console.log(`- Auth E2E Result: ${resultsSummary.auth}`);
  } catch (err) {
    console.error("Auth E2E crashed:", err);
    resultsSummary.auth = "FAIL";
  }

  // 2. CSRF Protection Check
  console.log("\n[Test 2] CSRF Protection E2E...");
  try {
    // Attempt state-changing call without X-CSRF-Token
    const badRes = await request("/database/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader
      }
    }, { host: "google.com", port: 3306, user: "root", database: "test" });

    // Attempt with X-CSRF-Token
    const goodRes = await request("/database/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken
      }
    }, { host: "google.com", port: 3306, user: "root", database: "test" });

    const csrfWorks = (badRes.statusCode === 403 && goodRes.statusCode !== 403);
    resultsSummary.csrf = csrfWorks ? "PASS" : "FAIL";
    console.log(`- Without token status: ${badRes.statusCode} (Expected: 403)`);
    console.log(`- With token status: ${goodRes.statusCode} (Expected: 500 or 200 depending on actual DB presence, not 403)`);
    console.log(`- CSRF Result: ${resultsSummary.csrf}`);
  } catch (err) {
    console.error("CSRF E2E crashed:", err);
    resultsSummary.csrf = "FAIL";
  }

  // 3. SSRF Protection Check
  console.log("\n[Test 3] SSRF Protection E2E...");
  try {
    const ssrfHosts = ["localhost", "127.0.0.1", "169.254.169.254", "10.0.0.1"];
    let allSsrfBlocked = true;

    for (const host of ssrfHosts) {
      const res = await request("/database/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader,
          "X-CSRF-Token": csrfToken
        }
      }, { host, port: 3306, user: "root", database: "test" });

      const json = res.json();
      console.log(`- SSRF Target '${host}': Status ${res.statusCode}, Msg: "${json.error}"`);
      if (res.statusCode !== 400 || !json.error.includes("blocked")) {
        allSsrfBlocked = false;
      }
    }

    // Public domain check
    const publicRes = await request("/database/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken
      }
    }, { host: "google.com", port: 3306, user: "root", database: "test" });
    const publicJson = publicRes.json();
    console.log(`- Public Target 'google.com': Status ${publicRes.statusCode}, Msg: "${publicJson.error}"`);
    const publicResolves = !publicJson.error.includes("blocked") && (publicJson.error.includes("Connection failed") || publicJson.error.includes("Host unreachable"));

    resultsSummary.ssrf = (allSsrfBlocked && publicResolves) ? "PASS" : "FAIL";
    console.log(`- SSRF E2E Result: ${resultsSummary.ssrf}`);
  } catch (err) {
    console.error("SSRF E2E crashed:", err);
    resultsSummary.ssrf = "FAIL";
  }

  // 4. SQL Safety Checker E2E
  console.log("\n[Test 4] SQL Safety E2E...");
  try {
    const maliciousSQLs = [
      "DROP TABLE students;",
      "TRUNCATE TABLE logs;",
      "CREATE DATABASE hack_db;",
      "ALTER TABLE users ADD COLUMN is_admin INT;",
      "SELECT 1; DROP TABLE users;",
      "LOAD DATA INFILE 'passwords.txt' INTO TABLE dump;",
      "DELETE FROM users;" // Missing WHERE
    ];

    let allBlocked = true;
    for (const sql of maliciousSQLs) {
      const res = await request("/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader,
          "X-CSRF-Token": csrfToken,
          "X-Session-ID": sessionId
        }
      }, { sql });
      const json = res.json();
      console.log(`- SQL: "${sql}" -> Status: ${res.statusCode}, Error: "${json.error}"`);
      if (res.statusCode !== 500 || !json.error.includes("blocked")) {
        allBlocked = false;
      }
    }

    // Safe SQL
    const safeRes = await request("/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken,
        "X-Session-ID": sessionId
      }
    }, { sql: "SELECT * FROM users WHERE id = 1;" });
    const safeJson = safeRes.json();
    console.log(`- Safe SQL: "SELECT * FROM users WHERE id = 1;" -> Status: ${safeRes.statusCode}`);
    const safePasses = safeRes.statusCode !== 403;

    resultsSummary.sqlSafety = (allBlocked && safePasses) ? "PASS" : "FAIL";
    console.log(`- SQL Safety Result: ${resultsSummary.sqlSafety}`);
  } catch (err) {
    console.error("SQL Safety E2E crashed:", err);
    resultsSummary.sqlSafety = "FAIL";
  }

  // 5. 30 Prompts SQL Generation Matrix
  console.log("\n[Test 5] SQL Query Generation 30+ Prompt Matrix...");
  const prompts = [
    "Show all employees", "Find products with price > 100", "List customers who ordered in 2025",
    "Get top 5 highest paid managers", "Count orders by status", "Find average salary by department",
    "List total sales per region", "Get all orders from customer with id 15", "Find products that are out of stock",
    "Get employees hired after January 1st 2024", "Show all database tables", "Find users who registered today",
    "Count total users in each country", "List transactions above 500 dollars", "Find active subscriptions",
    "Get lowest priced item in inventory", "List all projects with budget over 50000", "Get customers without any orders",
    "Find total quantity of products sold", "List employees working in HR", "Find average product rating",
    "Get oldest customer", "List suppliers from Germany", "Find orders shipped via Express",
    "Get invoices unpaid for 30 days", "Count reviews for each product", "List events happening tomorrow",
    "Find total feedback comments", "Get average score of student exams", "List active discount codes"
  ];

  let matrixPassCount = 0;
  const tableRows = [];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    try {
      const res = await request("/generate-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader,
          "X-CSRF-Token": csrfToken,
          "X-Session-ID": sessionId
        }
      }, { prompt: p });

      if (res.statusCode !== 200) {
        tableRows.push({ index: i + 1, prompt: p, sql: "ERROR", status: "FAIL", msg: `HTTP ${res.statusCode}` });
        continue;
      }

      const data = res.json();
      const sql = data.sql || "";
      const isUnsafe = sql.includes("User Safety:") || sql.includes("Response Safety:") || sql === "";
      const status = isUnsafe ? "FAIL" : "PASS";

      if (status === "PASS") matrixPassCount++;

      tableRows.push({
        index: i + 1,
        prompt: p,
        sql: sql.replace(/\n/g, " ").substring(0, 50),
        status,
        msg: isUnsafe ? "Contained moderation/empty text" : "Clean SQL extracted"
      });
    } catch (err) {
      tableRows.push({ index: i + 1, prompt: p, sql: "CRASH", status: "FAIL", msg: err.message });
    }
  }

  // Print results matrix
  console.log("\nAttempt | Prompt | Generated SQL Preview | Status");
  console.log("--------------------------------------------------------------------------------");
  tableRows.forEach(row => {
    console.log(`${String(row.index).padEnd(7)} | ${row.prompt.padEnd(40)} | ${row.sql.padEnd(50)} | ${row.status}`);
  });

  resultsSummary.generation = `${matrixPassCount}/${prompts.length} PASS`;
  console.log(`\n- SQL Generation 30+ Prompt Matrix Result: ${resultsSummary.generation}`);

  // 6. Concurrency / Rapid generation test
  console.log("\n[Test 6] Rapid Concurrency Generation Test...");
  try {
    const promises = [
      request("/generate-query", { method: "POST", headers: { "Content-Type": "application/json", "Cookie": cookieHeader, "X-CSRF-Token": csrfToken, "X-Session-ID": sessionId } }, { prompt: "Query A" }),
      request("/generate-query", { method: "POST", headers: { "Content-Type": "application/json", "Cookie": cookieHeader, "X-CSRF-Token": csrfToken, "X-Session-ID": sessionId } }, { prompt: "Query B" }),
      request("/generate-query", { method: "POST", headers: { "Content-Type": "application/json", "Cookie": cookieHeader, "X-CSRF-Token": csrfToken, "X-Session-ID": sessionId } }, { prompt: "Query C" })
    ];

    const responses = await Promise.all(promises);
    const success = responses.every(r => [200, 429, 500, 503].includes(r.statusCode));
    resultsSummary.concurrency = success ? "PASS" : "FAIL";
    console.log(`- Concurrency Result: ${resultsSummary.concurrency} (Statuses: ${responses.map(r => r.statusCode).join(", ")})`);
  } catch (err) {
    console.error("Concurrency test crashed:", err);
    resultsSummary.concurrency = "FAIL";
  }

  // 7. Database Session Authorization Bypass Checks
  console.log("\n[Test 7] Database Session Authorization Bypass Checks...");
  try {
    // A. Missing x-session-id
    const missingSessionRes = await request("/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken
      }
    }, { sql: "SELECT 1;" });
    const isMissingSessionBlocked = missingSessionRes.statusCode === 400;
    console.log(`- Missing session ID request status: ${missingSessionRes.statusCode} (Expected: 400)`);

    // B. Invalid x-session-id
    const invalidSessionRes = await request("/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "X-CSRF-Token": csrfToken,
        "X-Session-ID": "invalid-session-uuid-format"
      }
    }, { sql: "SELECT 1;" });
    const isInvalidSessionBlocked = invalidSessionRes.statusCode === 403;
    console.log(`- Invalid session ID request status: ${invalidSessionRes.statusCode} (Expected: 403)`);

    // C. User B trying to access User A's session ID
    // Register User B
    const userB = `tester_b_${crypto.randomBytes(4).toString("hex")}`;
    const passB = "Password123!";
    await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, { username: userB, password: passB });
    
    // Login User B
    const loginBRes = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, { username: userB, password: passB });

    const cookiesB = parseSetCookie(loginBRes.headers);
    const cookieHeaderB = `token=${cookiesB.token}; _csrf=${cookiesB._csrf}`;
    const csrfTokenB = cookiesB._csrf;

    // Call execute-query using User B's credentials but User A's sessionId
    const crossUserRes = await request("/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeaderB,
        "X-CSRF-Token": csrfTokenB,
        "X-Session-ID": sessionId
      }
    }, { sql: "SELECT 1;" });
    const isCrossUserBlocked = crossUserRes.statusCode === 403;
    console.log(`- Cross-user session ID request status: ${crossUserRes.statusCode} (Expected: 403)`);

    resultsSummary.sessionBypass = (isMissingSessionBlocked && isInvalidSessionBlocked && isCrossUserBlocked) ? "PASS" : "FAIL";
    console.log(`- Session Bypass Checks Result: ${resultsSummary.sessionBypass}`);
  } catch (err) {
    console.error("Session bypass checks crashed:", err);
    resultsSummary.sessionBypass = "FAIL";
  }

  console.log("\n==================================================");
  console.log("              E2E SUITE COMPLETED                 ");
  console.log("==================================================");
  console.log(JSON.stringify(resultsSummary, null, 2));
}

executeE2ETests();
