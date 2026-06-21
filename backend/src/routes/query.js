import { Router } from "express";
import { generateQuery } from "../controllers/queryController.js";

const router = Router();

// POST /generate-query (router mapped at index level)
router.post("/", generateQuery);

export default router;
