import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite logger will be created conditionally in development mode

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import Vite only in development
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  } as const;

  // Inline Vite configuration to avoid importing vite.config.ts
  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(__dirname, "../client"),
    plugins: [
      // We'll load React plugin dynamically if needed
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../client/src")
      }
    },
    build: {
      outDir: "../dist/public",
      emptyOutDir: true
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger?.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    // In production, serve a simple message if client build is missing
    app.use("*", (_req, res) => {
      res.status(200).send(`
        <html>
          <head><title>Dental Helper Dashboard</title></head>
          <body>
            <h1>Dental Helper Dashboard API</h1>
            <p>Server is running successfully!</p>
            <p>API endpoints are available at /api/*</p>
          </body>
        </html>
      `);
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}