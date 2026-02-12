import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

const app = express();

// Segurança: Helmet para headers HTTP seguros
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necessário para Vite em dev
    },
  },
}));

// Segurança: CORS configurado
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : true,
  credentials: true,
}));

// Segurança: Rate Limiting para evitar força bruta e DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: "Muitas requisições vindas deste IP, por favor tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Testar conexão com o banco de dados na inicialização
pool.query("SELECT 1")
  .then(() => log("CONEXÃO ESTABELECIDA: O servidor está conectado ao banco de dados real."))
  .catch((err) => {
    console.error("ERRO DE CONEXÃO: Falha ao conectar no banco de dados.");
    console.error("DETALHE DO ERRO:", err.message);
  });

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = ["DATABASE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERRO CRÍTICO: Variável de ambiente ${envVar} não está definida.`);
    process.exit(1);
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Configurar sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dashboard-pacientes-secret-key-default",
    resave: false,
    saveUninitialized: false,
    name: "sessionId", // Segurança: Não usar o nome padrão (connect.sid)
    cookie: {
      secure: process.env.NODE_ENV === "production", // Somente HTTPS em produção
      httpOnly: true, // Proteção contra XSS
      sameSite: 'lax', // Proteção contra CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 3000 if not specified.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
