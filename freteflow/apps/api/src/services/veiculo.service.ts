import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listarVeiculos() {
  return prisma.veiculo.findMany({
    orderBy: { criado_em: "desc" },
  });
}

export async function criarVeiculo(data: {
  placa: string;
  modelo: string;
  marca: string;
  ano_fabricacao: number;
  cor: string;
  chassis: string;
  categoria: string;
  tipo_combustivel: string;
  capacidade_tanque: number;
  capacidade_peso?: number;
  capacidade_volume?: number;
  quilometragem?: number;
}) {
  return prisma.veiculo.create({ data });
}

export async function buscarVeiculoPorId(id: number) {
  return prisma.veiculo.findUnique({ where: { id } });
}

export async function atualizarVeiculo(
  id: number,
  data: Prisma.VeiculoUpdateInput,
) {
  return prisma.veiculo.update({ where: { id }, data });
}

export async function removerVeiculo(id: number) {
  return prisma.veiculo.delete({ where: { id } });
}
