import { createHash, randomBytes } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const refreshCookieName = "freteflow_refresh";
export const refreshTokenDays = 30;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  return secret;
}

export function createAccessToken(user: { id: number; perfil: string }) {
  return jwt.sign({ perfil: user.perfil }, getJwtSecret(), {
    subject: String(user.id),
    expiresIn: "15m",
  });
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload === "string" ||
    !payload.sub ||
    typeof payload.perfil !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return payload as JwtPayload & { sub: string; perfil: string };
}

export function createRefreshToken() {
  return randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiration() {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + refreshTokenDays);
  return expiration;
}
