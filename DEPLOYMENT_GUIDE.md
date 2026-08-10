# Deployment Guide — AI SQL Query Generator Scaling & Limits

This document outlines the architectural specifications and lifecycle limits of the AI SQL Query Generator when transitioning from single-instance local hosting to production cloud environments.

## Process-Local Architectural Limits

To maintain efficiency and simplicity, the application uses process-local state for two critical features:
1. **Dynamic Database Connection Pools:** Active pools mapped via `sessionId` keys are stored in-memory inside `sessionPools` maps.
2. **Rate Limiting Counter Registry:** Client IP hits are stored in process memory.

### Scaling & High Availability Implications
Because these components are process-local, deploying multiple backend containers behind a round-robin Load Balancer will cause:
* **Connection Failures:** An execution request sent to Container B with a `sessionId` created on Container A will fail with a connection-mismatch or session-expired error.
* **Inconsistent Rate Limiting:** A client can bypass rate limits because requests are distributed across distinct container memory spaces.

---

## Production Scaling Blueprint

To scale the application to multiple container nodes (e.g., AWS ECS, Kubernetes, or GCP Cloud Run), implement the following modifications:

### 1. Database Connection Handling
* **Sticky Sessions (Recommended for Fast Deployment):** Configure the Cloud Load Balancer (e.g., AWS ALB) with **Cookie-based Sticky Sessions (Session Affinity)**. This forces all traffic matching a user session to route to the exact same backend container, keeping the connection pool active.
* **RDS Proxy / ProxySQL (Recommended for Enterprise Scaling):** Instead of creating dynamic pools directly on the Express process, interface with a centralized connection broker like AWS RDS Proxy or ProxySQL. Save custom user credentials encrypted in a central key store (like AWS Secrets Manager) and let the proxy handle connection multiplexing.

### 2. Distributed Rate Limiting
Replace the in-memory rate-limiter in `src/middleware/rateLimiter.js` with a Redis-backed rate limiter:
```javascript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 100,
});
```

---

## Environment Variables Configuration

Ensure the following variables are configured in the target production environment:

| Variable | Description | Recommended Production Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode indicator | `production` (enables Secure cookies, CSRF hardening, Strict-Transport-Security) |
| `FRONTEND_URL` | Allowed CORS client origin | E.g. `https://querygenerator.yourdomain.com` (locks access) |
| `JWT_SECRET` | Secret key for signing cookie tokens | A random 64-character hex string |
| `OPENROUTER_API_KEY` | OpenRouter access token | SECURE key (do not commit to git) |
| `MODEL_NAME` | AI Model identifier | E.g., `google/gemini-2.5-flash` |
| `OPENROUTER_HTTP_REFERER` | Refers the request source | E.g., `https://querygenerator.yourdomain.com` |
| `DB_HOST` | Default local database host | Resolved hostname of the central MySQL database |
