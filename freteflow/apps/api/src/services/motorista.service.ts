import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listarMotoristas() {
  return prisma.motorista.findMany({
    include: { veiculos: true },
    orderBy: { criado_em: "desc" },
  });
}

export async function criarMotorista(data: {
  nome: string;
  numero_cnh: string;
  validade_cnh: Date;
}) {
  return prisma.motorista.create({ data });
}

export async function buscarMotoristaPorId(id: number) {
  return prisma.motorista.findUnique({
    where: { id },
    include: { veiculos: true },
  });
}

export async function atualizarMotorista(
  id: number,
  data: Prisma.MotoristaUpdateInput,
) {
  return prisma.motorista.update({
    where: { id },
    data,
    include: { veiculos: true },
  });
}

export async function removerMotorista(id: number) {
  return prisma.motorista.delete({ where: { id } });
}

export async function associarVeiculo(motoristaId: number, veiculoId: number) {
  return prisma.motorista.update({
    where: { id: motoristaId },
    data: { veiculos: { connect: { id: veiculoId } } },
    include: { veiculos: true },
  });
}

export async function desassociarVeiculo(
  motoristaId: number,
  veiculoId: number,
) {
  return prisma.motorista.update({
    where: { id: motoristaId },
    data: { veiculos: { disconnect: { id: veiculoId } } },
    include: { veiculos: true },
  });
}
