import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Dental Helper Dashboard API is running" });
  });

  // User management endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // API info endpoint
  app.get("/api", (_req, res) => {
    res.json({
      name: "Dental Helper Dashboard API",
      version: "1.0.0",
      endpoints: [
        "GET /api/health - Health check",
        "GET /api/users/:id - Get user by ID",
        "POST /api/users - Create new user",
        "GET /api - This endpoint"
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
