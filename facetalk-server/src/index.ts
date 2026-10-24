import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import bookingRoutes from "./routes/bookings";
import adminAuthRoutes from "./routes/adminAuth";
import adminRoutes from "./routes/admin";
import contactRoutes from "./routes/contact";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// The website and the admin app are two different addresses. Both may call the API.
const allowedOrigins = (
  process.env.CLIENT_URLS ?? "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);

// Order matters: the admin login routes must come BEFORE the routes that
// require an admin session, or nobody could ever log in
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// Catches any error a route did not handle itself
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res
    .status(500)
    .json({ message: "Something went wrong on our side. Please try again." });
});

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing. Add it to your .env file.");
    }
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error);
    process.exit(1);
  }
}

start();
