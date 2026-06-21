import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import queryRouter from "./routes/query.js";
import explainRouter from "./routes/explain.js";
import impactRouter from "./routes/impact.js";
import executeRouter from "./routes/execute.js";
import historyRouter from "./routes/history.js";
import exportRouter from "./routes/export.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/generate-query", queryRouter);
app.use("/explain-query", explainRouter);
app.use("/analyze-impact", impactRouter);
app.use("/execute-query", executeRouter);
app.use("/history", historyRouter);
app.use("/export-csv", exportRouter);

// Root route welcome message
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AI SQL Query Generator API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
