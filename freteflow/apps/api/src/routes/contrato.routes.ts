import { Router } from "express";
import {
  deleteContrato,
  getContrato,
  getContratos,
  patchContrato,
  postContrato,
} from "../controllers/contrato.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  contractCreateSchema,
  contractUpdateSchema,
} from "../validation/schemas.js";

const contratoRoutes = Router();

contratoRoutes.get("/", getContratos);
contratoRoutes.post("/", validateBody(contractCreateSchema), postContrato);
contratoRoutes.get("/:id", getContrato);
contratoRoutes.patch("/:id", validateBody(contractUpdateSchema), patchContrato);
contratoRoutes.delete("/:id", deleteContrato);

export default contratoRoutes;
