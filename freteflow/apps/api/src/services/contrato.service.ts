import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listarContratos() {
  return prisma.contrato.findMany({
    include: { cliente: true },
    orderBy: { criado_em: "desc" },
  });
}

export async function criarContrato(data: {
  numero_contrato: string;
  data_inicio: Date;
  data_fim: Date;
  clienteId: number;
  status?: string;
}) {
  return prisma.contrato.create({
    data,
    include: { cliente: true },
  });
}

export async function buscarContratoPorId(id: number) {
  return prisma.contrato.findUnique({
    where: { id },
    include: { cliente: true },
  });
}

export async function atualizarContrato(
  id: number,
  data: Prisma.ContratoUpdateInput,
) {
  return prisma.contrato.update({
    where: { id },
    data,
    include: { cliente: true },
  });
}

export async function removerContrato(id: number) {
  return prisma.contrato.delete({ where: { id } });
}
