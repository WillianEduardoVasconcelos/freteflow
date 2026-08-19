import { Router } from "express";
import {
  deleteVeiculo,
  getVeiculo,
  getVeiculos,
  patchVeiculo,
  postVeiculo,
} from "../controllers/veiculo.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  vehicleCreateSchema,
  vehicleUpdateSchema,
} from "../validation/schemas.js";

const veiculoRoutes = Router();

veiculoRoutes.get("/", getVeiculos);
veiculoRoutes.post("/", validateBody(vehicleCreateSchema), postVeiculo);
veiculoRoutes.get("/:id", getVeiculo);
veiculoRoutes.patch("/:id", validateBody(vehicleUpdateSchema), patchVeiculo);
veiculoRoutes.delete("/:id", deleteVeiculo);

export default veiculoRoutes;
