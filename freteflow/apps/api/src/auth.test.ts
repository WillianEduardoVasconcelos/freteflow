import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { after, test } from "node:test";
import speakeasy from "speakeasy";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

process.env.JWT_SECRET = "test-secret-with-at-least-32-characters-long";

after(async () => {
  await prisma.$disconnect();
});

function csrfTokenFrom(response: {
  headers: Record<string, string | string[]>;
}) {
  const cookies = response.headers["set-cookie"];
  const csrfCookie = (Array.isArray(cookies) ? cookies : [cookies]).find(
    (cookie) => cookie?.startsWith("freteflow_csrf="),
  );

  return csrfCookie?.split(";", 1)[0].split("=", 2)[1];
}

test("autentica, renova e encerra uma sessão segura", async () => {
  const email = `auth-${Date.now()}@example.local`;
  const user = await prisma.usuario.create({
    data: {
      nome: "Usuário de autenticação",
      email,
      senha_hash: await bcrypt.hash("SenhaSegura123!", 12),
      perfil: "operador",
    },
  });
  const agent = request.agent(app);

  try {
    const loginResponse = await agent.post("/api/auth/login").send({
      email,
      senha: "SenhaSegura123!",
    });

    assert.equal(loginResponse.status, 200);
    assert.ok(loginResponse.body.accessToken);
    assert.equal(loginResponse.body.user.id, user.id);
    assert.ok(
      loginResponse.headers["set-cookie"].some((cookie: string) =>
        cookie.includes("HttpOnly"),
      ),
    );
    const csrfToken = csrfTokenFrom(loginResponse);
    assert.ok(csrfToken);

    const refreshResponse = await agent
      .post("/api/auth/refresh")
      .set("X-CSRF-Token", csrfToken);
    assert.equal(refreshResponse.status, 200);
    assert.ok(refreshResponse.body.accessToken);

    const logoutResponse = await agent
      .post("/api/auth/logout")
      .set("X-CSRF-Token", csrfToken);
    assert.equal(logoutResponse.status, 204);

    const refreshAfterLogoutResponse = await agent.post("/api/auth/refresh");
    assert.equal(refreshAfterLogoutResponse.status, 403);
  } finally {
    await prisma.usuario.delete({ where: { id: user.id } });
  }
});

test("rejeita senha incorreta sem revelar qual credencial falhou", async () => {
  const email = `invalid-${Date.now()}@example.local`;
  const user = await prisma.usuario.create({
    data: {
      nome: "Usuário inválido",
      email,
      senha_hash: await bcrypt.hash("SenhaCorreta123!", 12),
    },
  });

  try {
    const response = await request(app).post("/api/auth/login").send({
      email,
      senha: "SenhaErrada123!",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Credenciais inválidas");
  } finally {
    await prisma.usuario.delete({ where: { id: user.id } });
  }
});

test("configura 2FA e exige código no login", async () => {
  const email = `two-factor-${Date.now()}@example.local`;
  const user = await prisma.usuario.create({
    data: {
      nome: "Usuário 2FA",
      email,
      senha_hash: await bcrypt.hash("SenhaSegura123!", 12),
    },
  });

  try {
    const initialLogin = await request(app).post("/api/auth/login").send({
      email,
      senha: "SenhaSegura123!",
    });
    assert.equal(initialLogin.status, 200);

    const setupResponse = await request(app)
      .post("/api/auth/2fa/setup")
      .set("Authorization", `Bearer ${initialLogin.body.accessToken}`);
    assert.equal(setupResponse.status, 200);
    assert.ok(setupResponse.body.secret);

    const code = speakeasy.totp({
      secret: setupResponse.body.secret,
      encoding: "base32",
    });
    const verifyResponse = await request(app)
      .post("/api/auth/2fa/verify")
      .set("Authorization", `Bearer ${initialLogin.body.accessToken}`)
      .send({ codigo2fa: code });
    assert.equal(verifyResponse.status, 200);

    const blockedLogin = await request(app).post("/api/auth/login").send({
      email,
      senha: "SenhaSegura123!",
    });
    assert.equal(blockedLogin.status, 401);

    const validLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        senha: "SenhaSegura123!",
        codigo2fa: speakeasy.totp({
          secret: setupResponse.body.secret,
          encoding: "base32",
        }),
      });
    assert.equal(validLogin.status, 200);
  } finally {
    await prisma.usuario.delete({ where: { id: user.id } });
  }
});
