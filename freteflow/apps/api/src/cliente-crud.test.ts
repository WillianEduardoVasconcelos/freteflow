import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("consulta, atualiza e remove um cliente", async () => {
  const documento = `CRUD${Date.now()}`;
  let clienteId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", authHeader())
      .send({
        nome: "Cliente CRUD",
        documento,
      });

    assert.equal(createdResponse.status, 201);
    clienteId = createdResponse.body.id;

    const fetchedResponse = await request(app)
      .get(`/api/clients/${clienteId}`)
      .set("Authorization", authHeader());
    assert.equal(fetchedResponse.status, 200);
    assert.equal(fetchedResponse.body.id, clienteId);

    const updatedResponse = await request(app)
      .patch(`/api/clients/${clienteId}`)
      .set("Authorization", authHeader())
      .send({ nome: "Cliente Atualizado", status: "inativo" });
    assert.equal(updatedResponse.status, 200);
    assert.equal(updatedResponse.body.nome, "Cliente Atualizado");
    assert.equal(updatedResponse.body.status, "inativo");

    const deletedResponse = await request(app)
      .delete(`/api/clients/${clienteId}`)
      .set("Authorization", authHeader());
    assert.equal(deletedResponse.status, 204);

    const missingResponse = await request(app)
      .get(`/api/clients/${clienteId}`)
      .set("Authorization", authHeader());
    assert.equal(missingResponse.status, 404);
  } finally {
    if (clienteId) {
      await prisma.cliente.deleteMany({ where: { id: clienteId } });
    }
  }
});
