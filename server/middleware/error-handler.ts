import { Request, Response, NextFunction } from "express";

/**
 * Global error handler - catches any unhandled errors from route handlers.
 * Must be registered as the last middleware in the Express app.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.message);

  // Don't leak stack traces in production
  if (process.env.NODE_ENV === "production") {
    res.status(500).json({ error: "Internal server error" });
  } else {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
