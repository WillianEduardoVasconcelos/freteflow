import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("consulta, atualiza e remove um contrato", async () => {
  const timestamp = Date.now();
  let clienteId: number | undefined;
  let contratoId: number | undefined;

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nome: "Cliente CRUD de contrato",
        documento: `CCT${timestamp}`,
      },
    });
    clienteId = cliente.id;

    const createdResponse = await request(app)
      .post("/api/contracts")
      .set("Authorization", authHeader())
      .send({
        numero_contrato: `CRUD-${timestamp}`,
        data_inicio: "2026-01-01",
        data_fim: "2026-12-31",
        clienteId,
      });
    assert.equal(createdResponse.status, 201);
    contratoId = createdResponse.body.id;

    const fetchedResponse = await request(app)
      .get(`/api/contracts/${contratoId}`)
      .set("Authorization", authHeader());
    assert.equal(fetchedResponse.status, 200);

    const updatedResponse = await request(app)
      .patch(`/api/contracts/${contratoId}`)
      .set("Authorization", authHeader())
      .send({ status: "suspenso", data_fim: "2027-01-31" });
    assert.equal(updatedResponse.status, 200);
    assert.equal(updatedResponse.body.status, "suspenso");

    const deletedResponse = await request(app)
      .delete(`/api/contracts/${contratoId}`)
      .set("Authorization", authHeader());
    assert.equal(deletedResponse.status, 204);

    const missingResponse = await request(app)
      .get(`/api/contracts/${contratoId}`)
      .set("Authorization", authHeader());
    assert.equal(missingResponse.status, 404);
  } finally {
    if (contratoId) {
      await prisma.contrato.deleteMany({ where: { id: contratoId } });
    }
    if (clienteId) {
      await prisma.cliente.deleteMany({ where: { id: clienteId } });
    }
  }
});
