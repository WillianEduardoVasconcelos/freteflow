import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("aplica cabeçalhos de segurança", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.ok(response.headers["content-security-policy"]);
});

test("retorna 404 para rota inexistente", async () => {
  const response = await request(app).get("/api/rota-inexistente");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Rota não encontrada");
});

test("rejeita JSON inválido sem expor detalhes internos", async () => {
  const response = await request(app)
    .post("/api/clients")
    .set("Content-Type", "application/json")
    .send('{"nome":');

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "JSON da requisição inválido");
  assert.equal(response.body.stack, undefined);
});

test("bloqueia rota de domínio sem autenticação", async () => {
  const response = await request(app).get("/api/clients");

  assert.equal(response.status, 401);
  assert.equal(response.body.error, "Token de acesso ausente");
});

test("bloqueia perfil sem permissão para a área", async () => {
  const response = await request(app)
    .get("/api/clients")
    .set("Authorization", authHeader("motorista"));

  assert.equal(response.status, 403);
  assert.equal(response.body.error, "Acesso negado");
});
