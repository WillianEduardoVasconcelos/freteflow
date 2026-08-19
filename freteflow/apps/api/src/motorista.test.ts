import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("cadastra e lista um motorista", async () => {
  const numeroCnh = `TST${Date.now()}`;
  let motoristaId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/drivers")
      .set("Authorization", authHeader())
      .send({
        nome: "Motorista de teste",
        numero_cnh: numeroCnh,
        validade_cnh: "2030-12-31",
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.numero_cnh, numeroCnh);
    motoristaId = createdResponse.body.id;

    const listedResponse = await request(app)
      .get("/api/drivers")
      .set("Authorization", authHeader());
    assert.equal(listedResponse.status, 200);
    assert.ok(
      listedResponse.body.some(
        (driver: { id: number }) => driver.id === motoristaId,
      ),
    );
  } finally {
    if (motoristaId) {
      await prisma.motorista.deleteMany({ where: { id: motoristaId } });
    }
  }
});

test("rejeita validade de CNH inválida", async () => {
  const response = await request(app)
    .post("/api/drivers")
    .set("Authorization", authHeader())
    .send({
      nome: "Motorista inválido",
      numero_cnh: "INVALID-DATE-TEST",
      validade_cnh: "data-invalida",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
  assert.ok(
    response.body.fields.some(
      (field: { path: string }) => field.path === "validade_cnh",
    ),
  );
});
