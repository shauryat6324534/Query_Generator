import { Router } from "express";
import { optimizeQuery } from "../controllers/optimizeController.js";

const router = Router();

// POST /optimize-query
router.post("/", optimizeQuery);

export default router;
