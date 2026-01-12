import express from "express";
import cors from "cors";
import "./db";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express(); // ✅ MUST COME FIRST

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Vibbe backend running");
});

// ✅ ROUTES (ORDER IS IMPORTANT)
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

export default app;
