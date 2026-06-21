import { Router } from "express";
import { analyzeImpact } from "../controllers/impactController.js";

const router = Router();

// POST /analyze-impact
router.post("/", analyzeImpact);

export default router;
