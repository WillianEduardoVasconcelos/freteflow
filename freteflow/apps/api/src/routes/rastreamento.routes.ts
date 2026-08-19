import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  getRastreamentos,
  postRastreamento,
} from "../controllers/rastreamento.controller.js";
import { trackingCreateSchema } from "../validation/schemas.js";

const rastreamentoRoutes = Router();

rastreamentoRoutes.post(
  "/",
  authorize("admin", "operador", "motorista"),
  validateBody(trackingCreateSchema),
  postRastreamento,
);
rastreamentoRoutes.get(
  "/:freteId",
  authorize("admin", "operador"),
  getRastreamentos,
);

export default rastreamentoRoutes;
