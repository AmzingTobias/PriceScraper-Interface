import { configDotenv } from "dotenv";
configDotenv();

import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

import { productRouter } from "./routes/product.routes";
import { priceRouter } from "./routes/price.routes";
import { siteRouter } from "./routes/site.routes";
import { notificationRouter } from "./routes/notification.routes";
import { imageRouter } from "./routes/image.routes";
import { userRouter } from "./routes/user.routes";
import { scraperRouter } from "./routes/scraper.routes";
import { tUserAccount } from "./common/user";
import { getScraperConnection } from "./common/scraper";
import { errorHandler } from "./middleware/error-handler";
import { apiRateLimiter } from "./middleware/rate-limit";

declare global {
  namespace Express {
    interface Request {
      user?: tUserAccount;
    }
  }
}

// Validate required env vars on startup
const requiredEnvVars = ["API_SECRET", "DATABASE_PATH"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Start the price scraper
getScraperConnection();

const app: Express = express();
const port: number = Number(process.env.PORT) || 5000;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded cross-origin
}));

// CORS — allow frontend origins
const corsOrigins = new Set(
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:3000"]
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || corsOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for cookies
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// General rate limiting
app.use(apiRateLimiter);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/products", productRouter);
app.use("/api/prices", priceRouter);
app.use("/api/sites", siteRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/images", imageRouter);
app.use("/api/users", userRouter);
app.use("/api/scraper", scraperRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
