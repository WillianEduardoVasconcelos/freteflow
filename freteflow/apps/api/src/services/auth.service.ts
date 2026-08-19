import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { prisma } from "../config/prisma.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiration,
} from "../config/auth.js";

export class InvalidCredentialsError extends Error {}

export async function setupTwoFactor(userId: number, email: string) {
  const secret = speakeasy.generateSecret({
    name: `FreteFlow:${email}`,
    issuer: "FreteFlow",
  });

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      dois_fatores: false,
      dois_fatores_secret: secret.base32,
    },
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

export async function verifyTwoFactor(userId: number, token: string) {
  const user = await prisma.usuario.findUnique({ where: { id: userId } });

  if (!user?.dois_fatores_secret) {
    return false;
  }

  const valid = speakeasy.totp.verify({
    secret: user.dois_fatores_secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (valid) {
    await prisma.usuario.update({
      where: { id: userId },
      data: { dois_fatores: true },
    });
  }

  return valid;
}

export function isTwoFactorCodeValid(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.senha_hash))) {
    throw new InvalidCredentialsError("Invalid credentials");
  }

  return user;
}

export async function issueTokens(user: { id: number; perfil: string }) {
  const refreshToken = createRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token_hash: hashRefreshToken(refreshToken),
      expires_at: refreshTokenExpiration(),
      usuarioId: user.id,
    },
  });

  return {
    accessToken: createAccessToken(user),
    refreshToken,
  };
}

export async function rotateRefreshToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token_hash: tokenHash },
    include: { usuario: true },
  });

  if (
    !storedToken ||
    storedToken.revoked_at ||
    storedToken.expires_at <= new Date()
  ) {
    throw new InvalidCredentialsError("Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked_at: new Date() },
  });

  return issueTokens(storedToken.usuario);
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: {
      token_hash: hashRefreshToken(refreshToken),
      revoked_at: null,
    },
    data: { revoked_at: new Date() },
  });
}
