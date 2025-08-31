import { config } from 'dotenv';
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('API Error:', err);
  res.status(status).json({ message });
});

// Initialize routes
let routesInitialized = false;

// Middleware to ensure routes are initialized
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!routesInitialized) {
    try {
      await registerRoutes(app);
      routesInitialized = true;
      console.log('Routes registered successfully');
    } catch (error) {
      console.error('Failed to register routes:', error);
      return res.status(500).json({ error: 'Failed to initialize routes' });
    }
  }
  next();
});

export default app;
