import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

after(async () => {
  await prisma.$disconnect();
});

test("executa o ciclo completo de um veículo", async () => {
  const placa = `TST${Date.now().toString().slice(-5)}`;
  const chassis = `9FT${Date.now().toString().slice(-14)}`;
  let vehicleId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", authHeader())
      .send({
        placa,
        modelo: "Veículo de teste",
        marca: "FreteFlow",
        ano_fabricacao: 2025,
        cor: "Branco",
        chassis,
        categoria: "caminhao",
        tipo_combustivel: "diesel",
        capacidade_tanque: 300,
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.placa, placa);
    vehicleId = createdResponse.body.id;

    const fetchedResponse = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set("Authorization", authHeader());
    assert.equal(fetchedResponse.status, 200);
    assert.equal(fetchedResponse.body.id, vehicleId);

    const updatedResponse = await request(app)
      .patch(`/api/vehicles/${vehicleId}`)
      .set("Authorization", authHeader())
      .send({ cor: "Prata", status: "inativo" });
    assert.equal(updatedResponse.status, 200);
    assert.equal(updatedResponse.body.cor, "Prata");
    assert.equal(updatedResponse.body.status, "inativo");

    const listedResponse = await request(app)
      .get("/api/vehicles")
      .set("Authorization", authHeader());
    assert.equal(listedResponse.status, 200);
    assert.ok(
      listedResponse.body.some(
        (vehicle: { id: number }) => vehicle.id === vehicleId,
      ),
    );

    const deletedResponse = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", authHeader());
    assert.equal(deletedResponse.status, 204);

    const missingResponse = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set("Authorization", authHeader());
    assert.equal(missingResponse.status, 404);
  } finally {
    if (vehicleId) {
      await prisma.veiculo.deleteMany({ where: { id: vehicleId } });
    }
  }
});

test("rejeita veículo sem campos obrigatórios", async () => {
  const response = await request(app)
    .post("/api/vehicles")
    .set("Authorization", authHeader())
    .send({ placa: "INCOMPLETO" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
  assert.ok(
    response.body.fields.some(
      (field: { path: string }) => field.path === "modelo",
    ),
  );
  assert.ok(
    response.body.fields.some(
      (field: { path: string }) => field.path === "capacidade_tanque",
    ),
  );
});
