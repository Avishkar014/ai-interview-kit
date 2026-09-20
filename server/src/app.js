import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import kitsRoutes from "./routes/kits.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import questionsRoutes from "./routes/questions.routes.js";

import { config } from "./config/index.js";

const app = express();

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin: config.clientUrl || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* =====================================================
   ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/kits", kitsRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/practice", practiceRoutes);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (_request, response) => {
  const mongoStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  response.json({
    success: true,
    message: "API is running",
    mongodb: mongoStatus,
  });
});

/* =====================================================
   MONGODB CONNECTION
===================================================== */

const connectMongoDB = async () => {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(config.mongodbUri);

    console.log("========================================");
    console.log("MongoDB Status : CONNECTED");
    console.log(`MongoDB Host   : ${mongoose.connection.host}`);
    console.log(`Database       : ${mongoose.connection.name}`);
    console.log("========================================");
  } catch (error) {
    console.error("========================================");
    console.error("MongoDB Status : CONNECTION FAILED");
    console.error("Error          :", error.message);
    console.error("========================================");

    process.exit(1);
  }
};

/* =====================================================
   MONGODB EVENTS
===================================================== */

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Status : DISCONNECTED");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB Status : RECONNECTED");
});

/* =====================================================
   START BACKEND
===================================================== */

export const startServer = async () => {
  await connectMongoDB();

  app.listen(config.port, () => {
    console.log("========================================");
    console.log(`API listening on port ${config.port}`);
    console.log(
      `Health check    : http://localhost:${config.port}/api/health`
    );
    console.log("========================================");
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;