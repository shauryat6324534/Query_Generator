import { Router } from "express";
import { getSchema } from "../controllers/schemaController.js";

const router = Router();

// GET /schema
router.get("/", getSchema);

export default router;
