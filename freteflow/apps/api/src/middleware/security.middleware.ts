import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const allowedOrigins = (
  process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, "")) // Remove barras extras no final
  .filter(Boolean);

export const securityMiddleware = [
  // 1. CORS sempre em primeiro lugar para responder os Preflights (OPTIONS)
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "x-csrf-token",
    ],
  }),
  // 2. Blindagem de cabeçalhos HTTP
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
  // 3. Limitador de requisições
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: "Muitas requisições. Tente novamente mais tarde.",
    },
  }),
];
