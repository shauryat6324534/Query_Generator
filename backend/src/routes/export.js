import { Router } from "express";
import { exportCSV } from "../controllers/exportController.js";

const router = Router();

// POST /export-csv
router.post("/", exportCSV);

export default router;
