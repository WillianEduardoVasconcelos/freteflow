import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

export const csrfCookieName = "freteflow_csrf";
export const csrfHeaderName = "x-csrf-token";

export const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export function createCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function csrfProtection(
  request: Request,
  response: Response,
  next: () => void,
) {
  const cookieToken = request.cookies?.[csrfCookieName];
  const headerToken = request.header(csrfHeaderName);

  if (!cookieToken || !headerToken) {
    response.status(403).json({ error: "Token CSRF ausente" });
    return;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    response.status(403).json({ error: "Token CSRF inválido" });
    return;
  }

  next();
}
