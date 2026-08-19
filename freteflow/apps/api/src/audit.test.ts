import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

process.env.JWT_SECRET = "test-secret-with-at-least-32-characters-long";

after(async () => {
  await prisma.$disconnect();
});

test("registra sucesso e falha de login na auditoria", async () => {
  const email = `audit-${Date.now()}@example.local`;
  const user = await prisma.usuario.create({
    data: {
      nome: "Usuário de auditoria",
      email,
      senha_hash: await bcrypt.hash("SenhaSegura123!", 12),
    },
  });

  try {
    const successResponse = await request(app).post("/api/auth/login").send({
      email,
      senha: "SenhaSegura123!",
    });
    assert.equal(successResponse.status, 200);

    const failedResponse = await request(app).post("/api/auth/login").send({
      email,
      senha: "SenhaErrada123!",
    });
    assert.equal(failedResponse.status, 401);

    const events = await prisma.auditLog.findMany({
      where: {
        OR: [{ usuarioId: user.id }, { recurso_id: email }],
      },
      orderBy: { criado_em: "asc" },
    });
    const actions = events.map((event) => event.acao);

    assert.ok(actions.includes("login_success"));
    assert.ok(actions.includes("login_failed"));
    assert.ok(
      events.every((event) => !event.metadata?.toString().includes("Senha")),
    );
  } finally {
    await prisma.auditLog.deleteMany({
      where: { OR: [{ usuarioId: user.id }, { recurso_id: email }] },
    });
    await prisma.usuario.delete({ where: { id: user.id } });
  }
});
