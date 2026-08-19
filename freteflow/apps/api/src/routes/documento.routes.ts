import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  getDocumentos,
  postDocumento,
} from "../controllers/documento.controller.js";
import { documentCreateSchema } from "../validation/schemas.js";

const documentoRoutes = Router();

documentoRoutes.post(
  "/",
  authorize("admin", "operador"),
  validateBody(documentCreateSchema),
  postDocumento,
);
documentoRoutes.get("/:freteId", authorize("admin", "operador"), getDocumentos);

export default documentoRoutes;
