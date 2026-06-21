import { Router } from "express";
import { fetchHistory } from "../controllers/historyController.js";

const router = Router();

// GET /history
router.get("/", fetchHistory);

export default router;
