import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import collaborationsRouter from "./routes/collaborations.js";
import campaignsRouter from "./routes/campaigns.js";
import applicationsRouter from "./routes/applications.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 3000;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "CollaBridge API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/collaborations", collaborationsRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/applications", applicationsRouter);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`CreatorSync API listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
