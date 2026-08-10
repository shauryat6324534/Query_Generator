import { Router } from "express";
import { register, login, logout, me } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Apply strict rate limiting on registration and login to prevent brute force
router.post("/register", strictLimiter, register);
router.post("/login", strictLimiter, login);
router.post("/logout", logout);

// GET /auth/me returns current session user info
router.get("/me", authMiddleware, me);

export default router;
