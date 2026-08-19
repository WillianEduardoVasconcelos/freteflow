import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("cadastra e lista um contrato vinculado a cliente", async () => {
  const documento = `CTR${Date.now()}`;
  const numeroContrato = `CONTRATO-TESTE-${Date.now()}`;
  let clienteId: number | undefined;
  let contratoId: number | undefined;

  try {
    const clientResponse = await prisma.cliente.create({
      data: {
        nome: "Cliente de contrato",
        documento,
      },
    });
    clienteId = clientResponse.id;

    const createdResponse = await request(app)
      .post("/api/contracts")
      .set("Authorization", authHeader())
      .send({
        numero_contrato: numeroContrato,
        data_inicio: "2026-01-01",
        data_fim: "2026-12-31",
        clienteId,
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.numero_contrato, numeroContrato);
    assert.equal(createdResponse.body.cliente.id, clienteId);
    contratoId = createdResponse.body.id;

    const listedResponse = await request(app)
      .get("/api/contracts")
      .set("Authorization", authHeader());
    assert.equal(listedResponse.status, 200);
    assert.ok(
      listedResponse.body.some(
        (contract: { id: number }) => contract.id === contratoId,
      ),
    );
  } finally {
    if (contratoId) {
      await prisma.contrato.deleteMany({ where: { id: contratoId } });
    }
    if (clienteId) {
      await prisma.cliente.deleteMany({ where: { id: clienteId } });
    }
  }
});

test("rejeita contrato com datas invertidas", async () => {
  const response = await request(app)
    .post("/api/contracts")
    .set("Authorization", authHeader())
    .send({
      numero_contrato: `INVALIDO-${Date.now()}`,
      data_inicio: "2026-12-31",
      data_fim: "2026-01-01",
      clienteId: 1,
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
  assert.ok(
    response.body.fields.some(
      (field: { path: string }) => field.path === "data_fim",
    ),
  );
});
