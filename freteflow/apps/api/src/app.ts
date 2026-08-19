import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import contratoRoutes from "./routes/contrato.routes.js";
import freteRoutes from "./routes/frete.routes.js";
import rastreamentoRoutes from "./routes/rastreamento.routes.js";
import ocorrenciaRoutes from "./routes/ocorrencia.routes.js";
import documentoRoutes from "./routes/documento.routes.js";
import motoristaRoutes from "./routes/motorista.routes.js";
import veiculoRoutes from "./routes/veiculo.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { authenticate, authorize } from "./middleware/auth.middleware.js";
import { securityMiddleware } from "./middleware/security.middleware.js";

const app = express();

app.use(...securityMiddleware);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use(
  "/api/clients",
  authenticate,
  authorize("admin", "operador"),
  clienteRoutes,
);
app.use(
  "/api/contracts",
  authenticate,
  authorize("admin", "operador"),
  contratoRoutes,
);
app.use(
  "/api/freights",
  authenticate,
  authorize("admin", "operador"),
  freteRoutes,
);
app.use("/api/tracking", authenticate, rastreamentoRoutes);
app.use("/api/occurrences", authenticate, ocorrenciaRoutes);
app.use("/api/documents", authenticate, documentoRoutes);
app.use(
  "/api/drivers",
  authenticate,
  authorize("admin", "operador"),
  motoristaRoutes,
);
app.use(
  "/api/vehicles",
  authenticate,
  authorize("admin", "operador"),
  veiculoRoutes,
);

app.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      status: "ok",
      service: "freteflow-api",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    response.status(503).json({
      status: "error",
      service: "freteflow-api",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
