import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const securityMiddleware = [
  helmet(),
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem não permitida"));
    },
  }),
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
