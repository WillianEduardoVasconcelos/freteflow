import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listarClientes() {
  return prisma.cliente.findMany({
    orderBy: { criado_em: "desc" },
  });
}

export async function criarCliente(data: {
  nome: string;
  documento: string;
  email?: string;
  telefone?: string;
}) {
  return prisma.cliente.create({ data });
}

export async function buscarClientePorId(id: number) {
  return prisma.cliente.findUnique({ where: { id } });
}

export async function atualizarCliente(
  id: number,
  data: Prisma.ClienteUpdateInput,
) {
  return prisma.cliente.update({ where: { id }, data });
}

export async function removerCliente(id: number) {
  return prisma.cliente.delete({ where: { id } });
}
