import { Router } from "express";
import { explainQuery } from "../controllers/explainController.js";

const router = Router();

// POST /explain-query
router.post("/", explainQuery);

export default router;
