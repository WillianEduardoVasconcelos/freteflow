import assert from "node:assert/strict";
import { after, test } from "node:test";
import request from "supertest";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

after(async () => {
  await prisma.$disconnect();
});

test("bloqueia refresh sem token CSRF", async () => {
  const response = await request(app).post("/api/auth/refresh");

  assert.equal(response.status, 403);
  assert.equal(response.body.error, "Token CSRF ausente");
});

test("bloqueia logout com token CSRF divergente", async () => {
  const response = await request(app)
    .post("/api/auth/logout")
    .set("Cookie", "freteflow_csrf=cookie-token")
    .set("X-CSRF-Token", "header-token");

  assert.equal(response.status, 403);
  assert.equal(response.body.error, "Token CSRF inválido");
});
