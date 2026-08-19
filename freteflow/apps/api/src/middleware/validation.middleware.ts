import type { RequestHandler } from "express";
import { z } from "zod";

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: "Dados da requisição inválidos",
        fields: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    request.body = result.data;
    next();
  };
}
