import { Router } from "express";
import {
  deleteAssociacaoVeiculo,
  deleteMotorista,
  getMotorista,
  getMotoristas,
  patchMotorista,
  postAssociacaoVeiculo,
  postMotorista,
} from "../controllers/motorista.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  driverCreateSchema,
  driverUpdateSchema,
} from "../validation/schemas.js";

const motoristaRoutes = Router();

motoristaRoutes.get("/", getMotoristas);
motoristaRoutes.post("/", validateBody(driverCreateSchema), postMotorista);
motoristaRoutes.get("/:id", getMotorista);
motoristaRoutes.patch("/:id", validateBody(driverUpdateSchema), patchMotorista);
motoristaRoutes.delete("/:id", deleteMotorista);
motoristaRoutes.post("/:id/vehicles/:vehicleId", postAssociacaoVeiculo);
motoristaRoutes.delete("/:id/vehicles/:vehicleId", deleteAssociacaoVeiculo);

export default motoristaRoutes;
