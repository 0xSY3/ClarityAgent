import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import dotenv from 'dotenv';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import cors from 'cors';
import aiRouter from './routes/ai';

// Load environment variables from .env file
dotenv.config();

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/ai', aiRouter);

// Add error logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT 1`);
    log('Database connection successful');

    registerRoutes(app);
    const server = createServer(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Error:', err);  // Add error logging
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
      // Development port
      const PORT = 6969;
      server.listen(PORT, "0.0.0.0", () => {
        log(`Development server running on port ${PORT}`);
      });
    } else {
      serveStatic(app);
      // Production (Vercel) port
      const PORT = process.env.PORT || 3000;
      server.listen(PORT, () => {
        log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})().catch(error => {
  console.error('Server initialization error:', error);
  process.exit(1);
});
