import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("rejeita campos desconhecidos no cadastro de cliente", async () => {
  const response = await request(app)
    .post("/api/clients")
    .set("Authorization", authHeader())
    .send({
      nome: "Cliente válido",
      documento: "VALIDO-TESTE",
      extra: "não permitido",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
  assert.ok(
    response.body.fields.some((field: { message: string }) =>
      field.message.toLowerCase().includes("extra"),
    ),
  );
});

test("rejeita capacidade negativa no cadastro de veículo", async () => {
  const response = await request(app)
    .post("/api/vehicles")
    .set("Authorization", authHeader())
    .send({
      placa: "ZOD1A23",
      modelo: "Veículo inválido",
      marca: "FreteFlow",
      ano_fabricacao: 2025,
      cor: "Branco",
      chassis: "ZOD-CHASSIS-TEST",
      categoria: "caminhao",
      tipo_combustivel: "diesel",
      capacidade_tanque: -1,
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
});

test("rejeita login com email inválido", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "email-invalido",
    senha: "SenhaValida123!",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
});
