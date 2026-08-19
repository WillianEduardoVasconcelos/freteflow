import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("atualiza, associa e remove um motorista", async () => {
  const numeroCnh = `CRUD${Date.now()}`;
  let motoristaId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/drivers")
      .set("Authorization", authHeader())
      .send({
        nome: "Motorista CRUD",
        numero_cnh: numeroCnh,
        validade_cnh: "2030-12-31",
      });

    assert.equal(createdResponse.status, 201);
    motoristaId = createdResponse.body.id;

    const updatedResponse = await request(app)
      .patch(`/api/drivers/${motoristaId}`)
      .set("Authorization", authHeader())
      .send({ nome: "Motorista Atualizado", status: "inativo" });
    assert.equal(updatedResponse.status, 200);
    assert.equal(updatedResponse.body.nome, "Motorista Atualizado");

    const associatedResponse = await request(app)
      .post(`/api/drivers/${motoristaId}/vehicles/1`)
      .set("Authorization", authHeader());
    assert.equal(associatedResponse.status, 200);
    assert.ok(
      associatedResponse.body.veiculos.some(
        (vehicle: { id: number }) => vehicle.id === 1,
      ),
    );

    const disassociatedResponse = await request(app)
      .delete(`/api/drivers/${motoristaId}/vehicles/1`)
      .set("Authorization", authHeader());
    assert.equal(disassociatedResponse.status, 200);
    assert.equal(disassociatedResponse.body.veiculos.length, 0);

    const deletedResponse = await request(app)
      .delete(`/api/drivers/${motoristaId}`)
      .set("Authorization", authHeader());
    assert.equal(deletedResponse.status, 204);
  } finally {
    if (motoristaId) {
      await prisma.motorista.deleteMany({ where: { id: motoristaId } });
    }
  }
});
