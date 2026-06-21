import { Router } from "express";
import { executeQuery } from "../controllers/executeController.js";

const router = Router();

// POST /execute-query
router.post("/", executeQuery);

export default router;
