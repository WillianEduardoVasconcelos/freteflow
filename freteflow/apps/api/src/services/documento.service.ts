import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class DocumentoError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

export async function criarDocumento(data: {
  freteId: number;
  nome: string;
  tipo: string;
  url: string;
  ocorrenciaId?: number;
}) {
  const frete = await prisma.frete.findUnique({ where: { id: data.freteId } });

  if (!frete) {
    throw new DocumentoError("Frete não encontrado", 404);
  }

  if (data.ocorrenciaId !== undefined) {
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: data.ocorrenciaId },
      select: { freteId: true },
    });

    if (!ocorrencia) {
      throw new DocumentoError("Ocorrência não encontrada", 404);
    }

    if (ocorrencia.freteId !== data.freteId) {
      throw new DocumentoError("Ocorrência do documento não pertence ao frete");
    }
  }

  try {
    return await prisma.documento.create({
      data: {
        freteId: data.freteId,
        nome: data.nome,
        tipo: data.tipo,
        url: data.url,
        ocorrenciaId: data.ocorrenciaId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new DocumentoError("Frete ou ocorrência não encontrado", 404);
    }

    throw error;
  }
}

export async function listarDocumentos(freteId: number) {
  const frete = await prisma.frete.findUnique({ where: { id: freteId } });

  if (!frete) {
    throw new DocumentoError("Frete não encontrado", 404);
  }

  return prisma.documento.findMany({
    where: { freteId },
    orderBy: { criado_em: "desc" },
  });
}
