import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { refreshCookieName, refreshTokenDays } from "../config/auth.js";
import {
  createCsrfToken,
  csrfCookieName,
  csrfCookieOptions,
} from "../config/csrf.js";
import {
  authenticateUser,
  InvalidCredentialsError,
  isTwoFactorCodeValid,
  issueTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  setupTwoFactor,
  verifyTwoFactor,
} from "../services/auth.service.js";
import { registrarAuditoria } from "../services/audit.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: refreshTokenDays * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(response: Response, token: string) {
  response.cookie(refreshCookieName, token, refreshCookieOptions);
}

function setCsrfCookie(response: Response) {
  response.cookie(csrfCookieName, createCsrfToken(), csrfCookieOptions);
}

export async function postLogin(request: Request, response: Response) {
  const { email, senha, codigo2fa } = request.body as {
    email?: unknown;
    senha?: unknown;
    codigo2fa?: unknown;
  };

  if (!email || !senha) {
    response.status(400).json({ error: "Email e senha são obrigatórios" });
    return;
  }

  try {
    const user = await authenticateUser(
      String(email).trim().toLowerCase(),
      String(senha),
    );

    if (user.dois_fatores) {
      if (
        !codigo2fa ||
        !user.dois_fatores_secret ||
        !isTwoFactorCodeValid(user.dois_fatores_secret, String(codigo2fa))
      ) {
        await registrarAuditoria({
          request,
          acao: "login_2fa_failed",
          recurso: "Usuario",
          usuarioId: user.id,
        });
        response.status(401).json({ error: "Código 2FA inválido ou ausente" });
        return;
      }
    }

    const tokens = await issueTokens(user);
    setRefreshCookie(response, tokens.refreshToken);
    setCsrfCookie(response);
    await registrarAuditoria({
      request,
      acao: "login_success",
      recurso: "Usuario",
      recursoId: user.id,
      usuarioId: user.id,
    });

    response.status(200).json({
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      await registrarAuditoria({
        request,
        acao: "login_failed",
        recurso: "Usuario",
        recursoId: String(email).trim().toLowerCase(),
        metadata: { email: String(email).trim().toLowerCase() },
      });
      response.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    response.status(500).json({ error: "Não foi possível autenticar" });
  }
}

export async function postTwoFactorSetup(request: Request, response: Response) {
  const user = (request as Request & { user: { id: number } }).user;
  const result = await prisma.usuario.findUnique({ where: { id: user.id } });

  if (!result) {
    response.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const setup = await setupTwoFactor(user.id, result.email);
  await registrarAuditoria({
    request,
    acao: "2fa_setup",
    recurso: "Usuario",
    recursoId: user.id,
    usuarioId: user.id,
  });
  response.status(200).json(setup);
}

export async function postTwoFactorVerify(
  request: Request,
  response: Response,
) {
  const user = (request as Request & { user: { id: number } }).user;
  const { codigo2fa } = request.body as { codigo2fa: string };
  const verified = await verifyTwoFactor(user.id, codigo2fa);

  if (!verified) {
    await registrarAuditoria({
      request,
      acao: "2fa_verify_failed",
      recurso: "Usuario",
      usuarioId: user.id,
    });
    response.status(401).json({ error: "Código 2FA inválido" });
    return;
  }

  await registrarAuditoria({
    request,
    acao: "2fa_verify_success",
    recurso: "Usuario",
    usuarioId: user.id,
  });
  response.status(200).json({ dois_fatores: true });
}

export async function postRefresh(request: Request, response: Response) {
  const refreshToken = request.cookies?.[refreshCookieName];

  if (!refreshToken) {
    response.status(401).json({ error: "Refresh token ausente" });
    return;
  }

  try {
    const tokens = await rotateRefreshToken(refreshToken);
    setRefreshCookie(response, tokens.refreshToken);
    await registrarAuditoria({
      request,
      acao: "refresh_success",
      recurso: "RefreshToken",
    });
    response.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      await registrarAuditoria({
        request,
        acao: "refresh_failed",
        recurso: "RefreshToken",
      });
      response.status(401).json({ error: "Refresh token inválido" });
      return;
    }

    response.status(500).json({ error: "Não foi possível renovar a sessão" });
  }
}

export async function postLogout(request: Request, response: Response) {
  const refreshToken = request.cookies?.[refreshCookieName];

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  await registrarAuditoria({
    request,
    acao: "logout",
    recurso: "RefreshToken",
  });
  response.clearCookie(refreshCookieName, refreshCookieOptions);
  response.clearCookie(csrfCookieName, csrfCookieOptions);
  response.status(204).send();
}
