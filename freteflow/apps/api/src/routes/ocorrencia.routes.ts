import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  getOcorrencias,
  patchOcorrencia,
  postOcorrencia,
} from "../controllers/ocorrencia.controller.js";
import {
  occurrenceCreateSchema,
  occurrenceResolveSchema,
} from "../validation/schemas.js";

const ocorrenciaRoutes = Router();

ocorrenciaRoutes.post(
  "/",
  authorize("admin", "operador", "motorista"),
  validateBody(occurrenceCreateSchema),
  postOcorrencia,
);
ocorrenciaRoutes.get(
  "/:freteId",
  authorize("admin", "operador"),
  getOcorrencias,
);
ocorrenciaRoutes.patch(
  "/:id",
  authorize("admin", "operador"),
  validateBody(occurrenceResolveSchema),
  patchOcorrencia,
);

export default ocorrenciaRoutes;
