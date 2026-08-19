import { Router } from "express";
import {
  getFrete,
  getFretes,
  patchFrete,
  postFrete,
} from "../controllers/frete.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import { freteCreateSchema, freteUpdateSchema } from "../validation/schemas.js";

const freteRoutes = Router();

freteRoutes.get("/", getFretes);
freteRoutes.post("/", validateBody(freteCreateSchema), postFrete);
freteRoutes.get("/:id", getFrete);
freteRoutes.patch("/:id", validateBody(freteUpdateSchema), patchFrete);

export default freteRoutes;
