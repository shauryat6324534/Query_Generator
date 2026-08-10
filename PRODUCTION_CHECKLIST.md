# Production Security & Readiness Checklist

Use this checklist to verify that all hardening layers are configured and active before launching the application in a public cloud ecosystem.

## 1. Authentication & Session Integrity
* [ ] **HttpOnly Auth Cookie:** Assert that `token` is configured with `httpOnly: true`. This shields the session token from Cross-Site Scripting (XSS) extraction.
* [ ] **Secure Attribute:** Assert that `secure: true` is enabled in production. This restricts cookies to HTTPS-only connections.
* [ ] **SameSite Attribute:** Assert that `sameSite: "none"` (for cross-domain hosting) or `"lax"` (for same-domain hosting) is set.
* [ ] **Stateless Verification:** Confirm the custom HMAC SHA-256 validator verifies and enforces expiration (`exp`) checks.
* [ ] **No Local Storage:** Ensure no user session details or authorization tokens are stored in `localStorage` or `sessionStorage` in the browser client.

## 2. Cross-Site Request Forgery (CSRF)
* [ ] **Double-Submit Cookie Pattern:** Verify that the backend checks the custom header `X-CSRF-Token` against the `_csrf` cookie value.
* [ ] **State-Changing Endpoints Protected:** Verify that the `csrfMiddleware` is mounted on all `POST`, `PUT`, `DELETE` routes (placed directly after user authentication registration).
* [ ] **Refresh on Handshake:** Ensure a fresh CSRF token is generated and returned to the client on every `GET /auth/me` session validation.

## 3. Server-Side Request Forgery (SSRF)
* [ ] **DNS Lookup Check:** Ensure hostnames resolve to actual IPs before dynamic pools are established.
* [ ] **Loopback & Link-local Blocks:** Verify that `127.0.0.1`, `localhost`, `169.254.169.254` (cloud metadata), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and reserved IPv6 ranges (`::1`, `fc00::/7`, `fe80::/10`) are rejected.
* [ ] **Rebinding Prevention:** Confirm that the resolved IP address is used directly in the database pool configuration, rather than resolving the hostname again during connection instantiation.
* [ ] **Public Server Restriction:** Document in public guidelines that direct connection to local database instances on the developer's laptop is blocked by default.

## 4. SQL Safety & Execution Guardrails
* [ ] **Syntax Normalization:** Verify that comments (`/* ... */`, `--`, `#`) and string literal contents are stripped prior to parsing keywords.
* [ ] **Statement-Aware Filters:** Confirm that destructive commands (`DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `GRANT`, `REVOKE`, `RENAME`, `SET GLOBAL`) are blocked.
* [ ] **Filesystem Access Restrictions:** Ensure `LOAD DATA INFILE`, `INTO OUTFILE`, and `INTO DUMPFILE` operations are actively blocked.
* [ ] **Mass Mutate Preventions:** Confirm that `UPDATE` and `DELETE` queries are rejected if they do not contain a `WHERE` clause.
* [ ] **Stacked Statement Blocks:** Assert that semicolons (`;`) are rejected unless located as the terminal character of a single query.

## 5. System Limits & Shutdown Handler
* [ ] **CORS Origin Lock:** Lock access down by configuring the production `FRONTEND_URL` environment variable.
* [ ] **Payload Limits:** Verify that Express JSON body parsing is restricted to a maximum size of `50kb` to prevent memory exhaustion / DoS attacks.
* [ ] **Graceful Shutdowns:** Confirm that `SIGINT` and `SIGTERM` handlers terminate all active MySQL pool connections cleanly before exiting.
