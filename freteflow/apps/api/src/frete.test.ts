import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { authHeader } from "./test-auth.js";

process.env.JWT_SECRET = "test-secret-with-at-least-32-characters-long";

after(async () => {
  await prisma.$disconnect();
});

async function createFixture() {
  const timestamp = Date.now().toString();
  const cliente = await prisma.cliente.create({
    data: {
      nome: "Cliente de frete",
      documento: `FCLI${timestamp.slice(-14)}`,
    },
  });
  const veiculo = await prisma.veiculo.create({
    data: {
      placa: `FRT${timestamp.slice(-4)}1`,
      modelo: "Veículo de frete",
      marca: "FreteFlow",
      ano_fabricacao: 2025,
      cor: "Branco",
      chassis: `FRETE-CHASSIS-${timestamp}`,
      categoria: "caminhao",
      tipo_combustivel: "diesel",
      capacidade_tanque: 300,
      capacidade_peso: 1000,
      capacidade_volume: 10,
    },
  });
  const motorista = await prisma.motorista.create({
    data: {
      nome: "Motorista de frete",
      numero_cnh: `FCNH${timestamp.slice(-16)}`,
      validade_cnh: new Date("2030-12-31"),
      veiculos: { connect: { id: veiculo.id } },
    },
  });
  const contrato = await prisma.contrato.create({
    data: {
      numero_contrato: `FRETE-CONTRATO-${timestamp}`,
      data_inicio: new Date("2026-01-01"),
      data_fim: new Date("2030-12-31"),
      clienteId: cliente.id,
    },
  });

  return { cliente, veiculo, motorista, contrato };
}

async function cleanupFixture(
  fixture: Awaited<ReturnType<typeof createFixture>>,
) {
  await prisma.frete.deleteMany({
    where: {
      OR: [
        { clienteId: fixture.cliente.id },
        { contratoId: fixture.contrato.id },
        { veiculoId: fixture.veiculo.id },
      ],
    },
  });
  await prisma.contrato.delete({ where: { id: fixture.contrato.id } });
  await prisma.motorista.delete({ where: { id: fixture.motorista.id } });
  await prisma.veiculo.delete({ where: { id: fixture.veiculo.id } });
  await prisma.cliente.delete({ where: { id: fixture.cliente.id } });
}

test("cadastra, lista, consulta e atualiza um frete", async () => {
  const fixture = await createFixture();
  let freteId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/freights")
      .set("Authorization", authHeader())
      .send({
        numero_frete: `FRETE-${Date.now()}`,
        origem: "São Paulo - SP",
        destino: "Curitiba - PR",
        peso_kg: 500,
        volume_m3: 5,
        valor_frete: 1500,
        previsao_entrega: "2026-12-20",
        veiculoId: fixture.veiculo.id,
        motoristaId: fixture.motorista.id,
        contratoId: fixture.contrato.id,
        clienteId: fixture.cliente.id,
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.cliente.id, fixture.cliente.id);
    freteId = createdResponse.body.id;

    const listedResponse = await request(app)
      .get("/api/freights")
      .set("Authorization", authHeader());
    assert.equal(listedResponse.status, 200);
    assert.ok(
      listedResponse.body.some(
        (freight: { id: number }) => freight.id === freteId,
      ),
    );

    const fetchedResponse = await request(app)
      .get(`/api/freights/${freteId}`)
      .set("Authorization", authHeader());
    assert.equal(fetchedResponse.status, 200);

    const inTransitResponse = await request(app)
      .patch(`/api/freights/${freteId}`)
      .set("Authorization", authHeader())
      .send({ status: "em_transito" });
    assert.equal(inTransitResponse.status, 200);
    assert.equal(inTransitResponse.body.status, "em_transito");
    assert.ok(inTransitResponse.body.despachado_em);

    const deliveredResponse = await request(app)
      .patch(`/api/freights/${freteId}`)
      .set("Authorization", authHeader())
      .send({ status: "entregue" });
    assert.equal(deliveredResponse.status, 200);
    assert.equal(deliveredResponse.body.status, "entregue");
    assert.ok(deliveredResponse.body.entregue_em);
  } finally {
    await cleanupFixture(fixture);
  }
});

test("aplica capacidade e cancelamento antes do despacho", async () => {
  const fixture = await createFixture();
  let freteId: number | undefined;

  try {
    const oversizedResponse = await request(app)
      .post("/api/freights")
      .set("Authorization", authHeader())
      .send({
        numero_frete: `EXCESSO-${Date.now()}`,
        origem: "São Paulo - SP",
        destino: "Curitiba - PR",
        peso_kg: 1001,
        valor_frete: 100,
        veiculoId: fixture.veiculo.id,
        contratoId: fixture.contrato.id,
        clienteId: fixture.cliente.id,
      });
    assert.equal(oversizedResponse.status, 400);
    assert.match(oversizedResponse.body.error, /capacidade/);

    const createdResponse = await request(app)
      .post("/api/freights")
      .set("Authorization", authHeader())
      .send({
        numero_frete: `CANCELAR-${Date.now()}`,
        origem: "São Paulo - SP",
        destino: "Curitiba - PR",
        valor_frete: 100,
        veiculoId: fixture.veiculo.id,
        contratoId: fixture.contrato.id,
        clienteId: fixture.cliente.id,
      });
    assert.equal(createdResponse.status, 201);
    freteId = createdResponse.body.id;

    const cancelledResponse = await request(app)
      .patch(`/api/freights/${freteId}`)
      .set("Authorization", authHeader())
      .send({ status: "cancelado", motivo_cancelamento: "Teste operacional" });
    assert.equal(cancelledResponse.status, 200);
    assert.equal(cancelledResponse.body.status, "cancelado");
    assert.ok(cancelledResponse.body.cancelado_em);
  } finally {
    await cleanupFixture(fixture);
  }
});

test("rejeita campos extras no cadastro de frete", async () => {
  const response = await request(app)
    .post("/api/freights")
    .set("Authorization", authHeader())
    .send({
      numero_frete: "FRETE-INVALIDO",
      origem: "Origem",
      destino: "Destino",
      valor_frete: 100,
      veiculoId: 1,
      contratoId: 1,
      clienteId: 1,
      campo_extra: "não permitido",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
});
