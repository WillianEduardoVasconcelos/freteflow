import type { RequestHandler } from "express";
import { verifyAccessToken } from "../config/auth.js";

export const authenticate: RequestHandler = (request, response, next) => {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    response.status(401).json({ error: "Token de acesso ausente" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    (request as Request & { user: { id: number; perfil: string } }).user = {
      id: Number(payload.sub),
      perfil: payload.perfil,
    };
    next();
  } catch {
    response
      .status(401)
      .json({ error: "Token de acesso inválido ou expirado" });
  }
};

export function authorize(...allowedProfiles: string[]): RequestHandler {
  return (request, response, next) => {
    const user = (request as Request & { user?: { perfil: string } }).user;

    if (!user || !allowedProfiles.includes(user.perfil)) {
      response.status(403).json({ error: "Acesso negado" });
      return;
    }

    next();
  };
}
