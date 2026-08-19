import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  associarVeiculo,
  atualizarMotorista,
  buscarMotoristaPorId,
  criarMotorista,
  desassociarVeiculo,
  listarMotoristas,
  removerMotorista,
} from "../services/motorista.service.js";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseValidadeCnh(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function getMotoristas(_request: Request, response: Response) {
  const motoristas = await listarMotoristas();
  response.status(200).json(motoristas);
}

export async function postMotorista(request: Request, response: Response) {
  const body = request.body as Record<string, unknown>;
  const requiredFields = ["nome", "numero_cnh", "validade_cnh"];
  const missingFields = requiredFields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === "",
  );

  if (missingFields.length > 0) {
    response.status(400).json({
      error: "Campos obrigatórios ausentes",
      fields: missingFields,
    });
    return;
  }

  const validadeCnh = new Date(String(body.validade_cnh));

  if (Number.isNaN(validadeCnh.getTime())) {
    response.status(400).json({
      error: "Data de validade da CNH inválida",
    });
    return;
  }

  try {
    const motorista = await criarMotorista({
      nome: String(body.nome).trim(),
      numero_cnh: String(body.numero_cnh).trim(),
      validade_cnh: validadeCnh,
    });

    response.status(201).json(motorista);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      response.status(409).json({
        error: "Número de CNH já cadastrado",
      });
      return;
    }

    response.status(500).json({
      error: "Não foi possível cadastrar o motorista",
    });
  }
}

export async function getMotorista(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de motorista inválido" });
    return;
  }

  const motorista = await buscarMotoristaPorId(id);

  if (!motorista) {
    response.status(404).json({ error: "Motorista não encontrado" });
    return;
  }

  response.status(200).json(motorista);
}

export async function patchMotorista(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de motorista inválido" });
    return;
  }

  const body = request.body as Record<string, unknown>;
  const updateData: Prisma.MotoristaUpdateInput = {};
  const allowedFields = ["nome", "numero_cnh", "validade_cnh", "status"];
  const providedFields = allowedFields.filter((field) => field in body);

  if (providedFields.length === 0) {
    response
      .status(400)
      .json({ error: "Nenhum campo válido para atualização" });
    return;
  }

  if ("nome" in body && body.nome !== "") {
    updateData.nome = String(body.nome).trim();
  }

  if ("numero_cnh" in body && body.numero_cnh !== "") {
    updateData.numero_cnh = String(body.numero_cnh).trim();
  }

  if ("status" in body && body.status !== "") {
    updateData.status = String(body.status).trim();
  }

  if ("validade_cnh" in body) {
    const validadeCnh = parseValidadeCnh(body.validade_cnh);

    if (!validadeCnh) {
      response.status(400).json({ error: "Data de validade da CNH inválida" });
      return;
    }

    updateData.validade_cnh = validadeCnh;
  }

  try {
    const motorista = await atualizarMotorista(id, updateData);
    response.status(200).json(motorista);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Motorista não encontrado" });
        return;
      }

      if (error.code === "P2002") {
        response.status(409).json({ error: "Número de CNH já cadastrado" });
        return;
      }
    }

    response
      .status(500)
      .json({ error: "Não foi possível atualizar o motorista" });
  }
}

export async function deleteMotorista(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de motorista inválido" });
    return;
  }

  try {
    await removerMotorista(id);
    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Motorista não encontrado" });
        return;
      }

      if (error.code === "P2003") {
        response.status(409).json({
          error: "Motorista possui fretes relacionados e não pode ser removido",
        });
        return;
      }
    }

    response
      .status(500)
      .json({ error: "Não foi possível remover o motorista" });
  }
}

export async function postAssociacaoVeiculo(
  request: Request,
  response: Response,
) {
  const motoristaId = parseId(request.params.id);
  const veiculoId = parseId(request.params.vehicleId);

  if (!motoristaId || !veiculoId) {
    response.status(400).json({ error: "ID de motorista ou veículo inválido" });
    return;
  }

  try {
    const motorista = await associarVeiculo(motoristaId, veiculoId);
    response.status(200).json(motorista);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      response
        .status(404)
        .json({ error: "Motorista ou veículo não encontrado" });
      return;
    }

    response.status(500).json({ error: "Não foi possível associar o veículo" });
  }
}

export async function deleteAssociacaoVeiculo(
  request: Request,
  response: Response,
) {
  const motoristaId = parseId(request.params.id);
  const veiculoId = parseId(request.params.vehicleId);

  if (!motoristaId || !veiculoId) {
    response.status(400).json({ error: "ID de motorista ou veículo inválido" });
    return;
  }

  try {
    const motorista = await desassociarVeiculo(motoristaId, veiculoId);
    response.status(200).json(motorista);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      response
        .status(404)
        .json({ error: "Motorista ou veículo não encontrado" });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível desassociar o veículo" });
  }
}
