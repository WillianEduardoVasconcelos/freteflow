import type { Request } from "express";
import { prisma } from "../config/prisma.js";

type AuditInput = {
  request: Request;
  acao: string;
  recurso: string;
  recursoId?: number | string;
  usuarioId?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function registrarAuditoria(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        acao: input.acao,
        recurso: input.recurso,
        recurso_id:
          input.recursoId === undefined ? undefined : String(input.recursoId),
        usuarioId: input.usuarioId,
        ip: input.request.ip,
        user_agent: input.request.get("user-agent")?.slice(0, 255),
        metadata: input.metadata,
      },
    });
  } catch {}
}
