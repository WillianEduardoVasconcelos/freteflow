import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("cadastra e lista um cliente", async () => {
  const documento = `TST${Date.now()}`;
  let clienteId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", authHeader())
      .send({
        nome: "Cliente de teste",
        documento,
        email: "cliente.teste@example.local",
        telefone: "11999990000",
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.documento, documento);
    clienteId = createdResponse.body.id;

    const listedResponse = await request(app)
      .get("/api/clients")
      .set("Authorization", authHeader());
    assert.equal(listedResponse.status, 200);
    assert.ok(
      listedResponse.body.some(
        (client: { id: number }) => client.id === clienteId,
      ),
    );

    const duplicateResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", authHeader())
      .send({ nome: "Cliente duplicado", documento });
    assert.equal(duplicateResponse.status, 409);
  } finally {
    if (clienteId) {
      await prisma.cliente.deleteMany({ where: { id: clienteId } });
    }
  }
});

test("rejeita cliente sem documento", async () => {
  const response = await request(app)
    .post("/api/clients")
    .set("Authorization", authHeader())
    .send({ nome: "Cliente incompleto" });

  assert.equal(response.status, 400);
  assert.ok(
    response.body.fields.some(
      (field: { path: string }) => field.path === "documento",
    ),
  );
});
