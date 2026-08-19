import { Router } from "express";
import {
  deleteCliente,
  getCliente,
  getClientes,
  patchCliente,
  postCliente,
} from "../controllers/cliente.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import {
  clientCreateSchema,
  clientUpdateSchema,
} from "../validation/schemas.js";

const clienteRoutes = Router();

clienteRoutes.get("/", getClientes);
clienteRoutes.post("/", validateBody(clientCreateSchema), postCliente);
clienteRoutes.get("/:id", getCliente);
clienteRoutes.patch("/:id", validateBody(clientUpdateSchema), patchCliente);
clienteRoutes.delete("/:id", deleteCliente);

export default clienteRoutes;
