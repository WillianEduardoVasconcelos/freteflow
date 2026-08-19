import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
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
      nome: "Cliente suporte operacional",
      documento: `SUP${timestamp.slice(-17)}`,
    },
  });
  const veiculo = await prisma.veiculo.create({
    data: {
      placa: `SUP${timestamp.slice(-5)}1`,
      modelo: "Veículo suporte",
      marca: "FreteFlow",
      ano_fabricacao: 2025,
      cor: "Branco",
      chassis: `SUP-CHASSIS-${timestamp}`,
      categoria: "caminhao",
      tipo_combustivel: "diesel",
      capacidade_tanque: 300,
      capacidade_peso: 10000,
      capacidade_volume: 50,
    },
  });
  const contrato = await prisma.contrato.create({
    data: {
      numero_contrato: `SUP-CONTRATO-${timestamp}`,
      data_inicio: new Date("2026-01-01"),
      data_fim: new Date("2030-12-31"),
      clienteId: cliente.id,
    },
  });
  const frete = await prisma.frete.create({
    data: {
      numero_frete: `SUP-FRETE-${timestamp}`,
      origem: "São Paulo - SP",
      destino: "Curitiba - PR",
      valor_frete: new Prisma.Decimal("500.00"),
      veiculoId: veiculo.id,
      contratoId: contrato.id,
      clienteId: cliente.id,
    },
  });

  return { cliente, veiculo, contrato, frete };
}

async function cleanupFixture(
  fixture: Awaited<ReturnType<typeof createFixture>>,
) {
  await prisma.documento.deleteMany({ where: { freteId: fixture.frete.id } });
  await prisma.ocorrencia.deleteMany({ where: { freteId: fixture.frete.id } });
  await prisma.rastreamento.deleteMany({
    where: { freteId: fixture.frete.id },
  });
  await prisma.frete.delete({ where: { id: fixture.frete.id } });
  await prisma.contrato.delete({ where: { id: fixture.contrato.id } });
  await prisma.veiculo.delete({ where: { id: fixture.veiculo.id } });
  await prisma.cliente.delete({ where: { id: fixture.cliente.id } });
}

test("registra e consulta checkpoints de rastreamento com vínculo ao frete", async () => {
  const fixture = await createFixture();

  try {
    const createdResponse = await request(app)
      .post("/api/tracking")
      .set("Authorization", authHeader("motorista"))
      .send({
        freteId: fixture.frete.id,
        veiculoId: fixture.veiculo.id,
        latitude: -23.5505,
        longitude: -46.6333,
        velocidade_kmh: 65,
      });

    assert.equal(createdResponse.status, 201);
    assert.equal(createdResponse.body.freteId, fixture.frete.id);

    const listedResponse = await request(app)
      .get(`/api/tracking/${fixture.frete.id}`)
      .set("Authorization", authHeader("admin"));
    assert.equal(listedResponse.status, 200);
    assert.equal(listedResponse.body.length, 1);
  } finally {
    await cleanupFixture(fixture);
  }
});

test("registra ocorrência com motorista e restringe documentos por RBAC", async () => {
  const fixture = await createFixture();
  let ocorrenciaId: number | undefined;

  try {
    const occurrenceResponse = await request(app)
      .post("/api/occurrences")
      .set("Authorization", authHeader("motorista"))
      .send({
        freteId: fixture.frete.id,
        tipo: "atraso",
        descricao: "Atraso por congestionamento",
        ocorrido_em: "2026-08-18T12:00:00Z",
      });

    assert.equal(occurrenceResponse.status, 201);
    ocorrenciaId = occurrenceResponse.body.id;

    const listedOccurrences = await request(app)
      .get(`/api/occurrences/${fixture.frete.id}`)
      .set("Authorization", authHeader("operador"));
    assert.equal(listedOccurrences.status, 200);
    assert.equal(listedOccurrences.body.length, 1);

    const forbiddenDocument = await request(app)
      .post("/api/documents")
      .set("Authorization", authHeader("motorista"))
      .send({
        freteId: fixture.frete.id,
        ocorrenciaId,
        nome: "Comprovante",
        tipo: "comprovante_entrega",
        url: "https://example.com/comprovante.pdf",
      });
    assert.equal(forbiddenDocument.status, 403);

    const documentResponse = await request(app)
      .post("/api/documents")
      .set("Authorization", authHeader("admin"))
      .send({
        freteId: fixture.frete.id,
        ocorrenciaId,
        nome: "Comprovante",
        tipo: "comprovante_entrega",
        url: "https://example.com/comprovante.pdf",
      });
    assert.equal(documentResponse.status, 201);
    assert.equal(documentResponse.body.freteId, fixture.frete.id);

    const listedDocuments = await request(app)
      .get(`/api/documents/${fixture.frete.id}`)
      .set("Authorization", authHeader("admin"));
    assert.equal(listedDocuments.status, 200);
    assert.equal(listedDocuments.body.length, 1);
  } finally {
    await cleanupFixture(fixture);
  }
});

test("permite que operador resolva ocorrência e bloqueia motorista", async () => {
  const fixture = await createFixture();
  let ocorrenciaId: number | undefined;

  try {
    const createdResponse = await request(app)
      .post("/api/occurrences")
      .set("Authorization", authHeader("motorista"))
      .send({
        freteId: fixture.frete.id,
        tipo: "avaria",
        descricao: "Avaria registrada durante o transporte",
        ocorrido_em: "2026-08-18T12:00:00Z",
      });

    assert.equal(createdResponse.status, 201);
    ocorrenciaId = createdResponse.body.id;

    const forbiddenResponse = await request(app)
      .patch(`/api/occurrences/${ocorrenciaId}`)
      .set("Authorization", authHeader("motorista"))
      .send({
        status: "RESOLVIDA",
        resolucao: "Tentativa não autorizada",
        resolvido_em: "2026-08-18T14:00:00Z",
      });
    assert.equal(forbiddenResponse.status, 403);

    const resolvedResponse = await request(app)
      .patch(`/api/occurrences/${ocorrenciaId}`)
      .set("Authorization", authHeader("operador"))
      .send({
        status: "RESOLVIDA",
        resolucao: "Avaria solucionada e comprovante anexado",
        resolvido_em: "2026-08-18T15:00:00Z",
      });
    assert.equal(resolvedResponse.status, 200);
    assert.equal(resolvedResponse.body.status, "RESOLVIDA");
    assert.equal(
      resolvedResponse.body.resolucao,
      "Avaria solucionada e comprovante anexado",
    );
    assert.ok(resolvedResponse.body.resolvido_em);
  } finally {
    await cleanupFixture(fixture);
  }
});

test("rejeita resolução com status diferente de RESOLVIDA", async () => {
  const response = await request(app)
    .patch("/api/occurrences/1")
    .set("Authorization", authHeader("operador"))
    .send({
      status: "resolvida",
      resolucao: "Solução",
      resolvido_em: "2026-08-18T15:00:00Z",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Dados da requisição inválidos");
});

test("rejeita vínculos inexistentes e URL de documento inválida", async () => {
  const trackingResponse = await request(app)
    .post("/api/tracking")
    .set("Authorization", authHeader("motorista"))
    .send({
      freteId: 999999,
      veiculoId: 1,
      latitude: 0,
      longitude: 0,
    });
  assert.equal(trackingResponse.status, 404);

  const documentResponse = await request(app)
    .post("/api/documents")
    .set("Authorization", authHeader("admin"))
    .send({
      freteId: 1,
      nome: "Documento inválido",
      tipo: "nota_fiscal",
      url: "nao-e-url",
    });
  assert.equal(documentResponse.status, 400);
  assert.equal(documentResponse.body.error, "Dados da requisição inválidos");
});
