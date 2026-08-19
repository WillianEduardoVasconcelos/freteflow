import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class OcorrenciaError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

export async function criarOcorrencia(data: {
  freteId: number;
  tipo: string;
  descricao: string;
  impacto_financeiro?: number;
  ocorrido_em: Date;
}) {
  const frete = await prisma.frete.findUnique({ where: { id: data.freteId } });

  if (!frete) {
    throw new OcorrenciaError("Frete não encontrado", 404);
  }

  try {
    return await prisma.ocorrencia.create({
      data: {
        freteId: data.freteId,
        tipo: data.tipo,
        descricao: data.descricao,
        impacto_financeiro:
          data.impacto_financeiro === undefined
            ? undefined
            : new Prisma.Decimal(String(data.impacto_financeiro)),
        ocorrido_em: data.ocorrido_em,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new OcorrenciaError("Frete não encontrado", 404);
    }

    throw error;
  }
}

export async function listarOcorrencias(freteId: number) {
  const frete = await prisma.frete.findUnique({ where: { id: freteId } });

  if (!frete) {
    throw new OcorrenciaError("Frete não encontrado", 404);
  }

  return prisma.ocorrencia.findMany({
    where: { freteId },
    orderBy: { ocorrido_em: "desc" },
  });
}

export async function resolverOcorrencia(
  id: number,
  data: {
    status: "RESOLVIDA";
    resolucao: string;
    resolvido_em: Date;
  },
) {
  const ocorrencia = await prisma.ocorrencia.findUnique({ where: { id } });

  if (!ocorrencia) {
    throw new OcorrenciaError("Ocorrência não encontrada", 404);
  }

  if (ocorrencia.status === "RESOLVIDA") {
    throw new OcorrenciaError("Ocorrência já está resolvida");
  }

  return prisma.ocorrencia.update({
    where: { id },
    data: {
      status: data.status,
      resolucao: data.resolucao,
      resolvido_em: data.resolvido_em,
    },
  });
}
