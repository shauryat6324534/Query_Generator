import { Router } from "express";
import { register, login, logout, me, testSession } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Apply strict rate limiting on registration and login to prevent brute force
router.post("/register", strictLimiter, register);
router.post("/login", strictLimiter, login);
router.post("/logout", logout);

// GET /auth/me returns current session user info
router.get("/me", authMiddleware, me);

// Mount test session builder for development/testing environments
if (process.env.NODE_ENV !== "production") {
  router.post("/test-session", authMiddleware, testSession);
}

export default router;
