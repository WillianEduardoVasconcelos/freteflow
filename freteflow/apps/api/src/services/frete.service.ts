import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class FreteBusinessError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
  }
}

const activeContractStatuses = ["ativo"];
const activeVehicleStatuses = ["ativo"];

async function validateFreteRelations(data: {
  clienteId: number;
  contratoId: number;
  veiculoId: number;
  motoristaId?: number;
  peso_kg?: number;
  volume_m3?: number;
}) {
  const [cliente, contrato, veiculo] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: data.clienteId } }),
    prisma.contrato.findUnique({ where: { id: data.contratoId } }),
    prisma.veiculo.findUnique({
      where: { id: data.veiculoId },
      include: { motoristas: { select: { id: true } } },
    }),
  ]);

  if (!cliente) {
    throw new FreteBusinessError("Cliente não encontrado", 404);
  }

  if (cliente.status !== "ativo") {
    throw new FreteBusinessError("Cliente não está ativo");
  }

  if (!contrato) {
    throw new FreteBusinessError("Contrato não encontrado", 404);
  }

  const now = new Date();
  if (
    !activeContractStatuses.includes(contrato.status) ||
    now < contrato.data_inicio ||
    now > contrato.data_fim
  ) {
    throw new FreteBusinessError("Contrato não está ativo ou vigente");
  }

  if (contrato.clienteId !== data.clienteId) {
    throw new FreteBusinessError(
      "Cliente do frete não corresponde ao cliente do contrato",
    );
  }

  if (!veiculo) {
    throw new FreteBusinessError("Veículo não encontrado", 404);
  }

  if (!activeVehicleStatuses.includes(veiculo.status)) {
    throw new FreteBusinessError("Veículo não está ativo");
  }

  if (
    data.peso_kg !== undefined &&
    veiculo.capacidade_peso !== null &&
    data.peso_kg > veiculo.capacidade_peso
  ) {
    throw new FreteBusinessError(
      "Peso do frete excede a capacidade do veículo",
    );
  }

  if (
    data.volume_m3 !== undefined &&
    veiculo.capacidade_volume !== null &&
    data.volume_m3 > veiculo.capacidade_volume
  ) {
    throw new FreteBusinessError(
      "Volume do frete excede a capacidade do veículo",
    );
  }

  if (data.motoristaId !== undefined) {
    if (
      !veiculo.motoristas.some((motorista) => motorista.id === data.motoristaId)
    ) {
      throw new FreteBusinessError(
        "Motorista não está autorizado para este veículo",
      );
    }
  }
}

const freteInclude = {
  cliente: true,
  contrato: true,
  veiculo: true,
  motorista: true,
  rota: true,
} as const;

export async function listarFretes() {
  return prisma.frete.findMany({
    include: freteInclude,
    orderBy: { criado_em: "desc" },
  });
}

export async function buscarFretePorId(id: number) {
  return prisma.frete.findUnique({
    where: { id },
    include: freteInclude,
  });
}

export async function criarFrete(data: {
  numero_frete: string;
  origem: string;
  destino: string;
  peso_kg?: number;
  volume_m3?: number;
  valor_frete: number;
  previsao_entrega?: Date;
  veiculoId: number;
  motoristaId?: number;
  contratoId: number;
  clienteId: number;
  rotaId?: number;
}) {
  await validateFreteRelations(data);

  try {
    return await prisma.frete.create({
      data: {
        numero_frete: data.numero_frete,
        origem: data.origem,
        destino: data.destino,
        peso_kg: data.peso_kg,
        volume_m3: data.volume_m3,
        valor_frete: new Prisma.Decimal(String(data.valor_frete)),
        previsao_entrega: data.previsao_entrega,
        veiculoId: data.veiculoId,
        motoristaId: data.motoristaId,
        contratoId: data.contratoId,
        clienteId: data.clienteId,
        rotaId: data.rotaId,
      },
      include: freteInclude,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new FreteBusinessError("Número de frete já cadastrado", 409);
      }

      if (error.code === "P2003") {
        throw new FreteBusinessError(
          "Relacionamento do frete não encontrado",
          404,
        );
      }
    }

    throw error;
  }
}

export async function atualizarFrete(
  id: number,
  data: {
    status?: string;
    localizacao_lat?: number;
    localizacao_lng?: number;
    previsao_entrega?: Date;
    motivo_cancelamento?: string;
  },
) {
  const frete = await buscarFretePorId(id);

  if (!frete) {
    throw new FreteBusinessError("Frete não encontrado", 404);
  }

  if (data.status === "cancelado" && frete.despachado_em) {
    throw new FreteBusinessError(
      "Frete despachado não pode ser cancelado por esta operação",
    );
  }

  const updateData: Prisma.FreteUpdateInput = {
    status: data.status,
    localizacao_lat: data.localizacao_lat,
    localizacao_lng: data.localizacao_lng,
    previsao_entrega: data.previsao_entrega,
    motivo_cancelamento: data.motivo_cancelamento,
  };

  if (data.status === "em_transito" && !frete.despachado_em) {
    updateData.despachado_em = new Date();
  }

  if (data.status === "entregue" && !frete.entregue_em) {
    updateData.entregue_em = new Date();
  }

  if (data.status === "cancelado") {
    updateData.cancelado_em = new Date();
  }

  return prisma.frete.update({
    where: { id },
    data: updateData,
    include: freteInclude,
  });
}
