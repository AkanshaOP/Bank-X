import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Logging Middleware (Fixed Response Modification Issue)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;

  // Clone the original `res.json`
  const originalResJson = res.json.bind(res);

  res.json = function (bodyJson: Record<string, any>) {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      logLine += ` :: ${JSON.stringify(bodyJson)}`;
      
      // Ensure log line is not too long
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }

    return originalResJson(bodyJson);
  };

  next();
});

// ✅ Async Function to Setup Server
(async () => {
  try {
    const server = await registerRoutes(app);

    // ✅ Proper Error Handling Middleware (Fixed Crash Issue)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });

      // Instead of throwing, log the error
      log(`Error: ${message}`);
    });

    // ✅ Vite Setup (Properly Controlled)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ✅ Start Server on Port 5000
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    log(`❌ Failed to start server: ${error.message}`);
    process.exit(1); // Exit on failure
  }
})();
