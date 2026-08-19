import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class RastreamentoError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

async function validarFreteEVeiculo(freteId: number, veiculoId: number) {
  const frete = await prisma.frete.findUnique({
    where: { id: freteId },
    select: { id: true, veiculoId: true },
  });

  if (!frete) {
    throw new RastreamentoError("Frete não encontrado", 404);
  }

  if (frete.veiculoId !== veiculoId) {
    throw new RastreamentoError(
      "Veículo do rastreamento não corresponde ao veículo do frete",
    );
  }
}

export async function criarRastreamento(data: {
  freteId: number;
  veiculoId: number;
  latitude: number;
  longitude: number;
  velocidade_kmh?: number;
  registrado_em?: Date;
}) {
  await validarFreteEVeiculo(data.freteId, data.veiculoId);

  try {
    return await prisma.rastreamento.create({
      data: {
        freteId: data.freteId,
        veiculoId: data.veiculoId,
        latitude: new Prisma.Decimal(String(data.latitude)),
        longitude: new Prisma.Decimal(String(data.longitude)),
        velocidade_kmh: data.velocidade_kmh,
        registrado_em: data.registrado_em,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new RastreamentoError("Frete ou veículo não encontrado", 404);
    }

    throw error;
  }
}

export async function listarRastreamentos(freteId: number) {
  const frete = await prisma.frete.findUnique({ where: { id: freteId } });

  if (!frete) {
    throw new RastreamentoError("Frete não encontrado", 404);
  }

  return prisma.rastreamento.findMany({
    where: { freteId },
    orderBy: { registrado_em: "desc" },
  });
}
