import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  atualizarContrato,
  buscarContratoPorId,
  criarContrato,
  listarContratos,
  removerContrato,
} from "../services/contrato.service.js";

function parseDate(value: unknown) {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getContratos(_request: Request, response: Response) {
  const contratos = await listarContratos();
  response.status(200).json(contratos);
}

export async function postContrato(request: Request, response: Response) {
  const body = request.body as Record<string, unknown>;
  const requiredFields = [
    "numero_contrato",
    "data_inicio",
    "data_fim",
    "clienteId",
  ];
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

  const dataInicio = parseDate(body.data_inicio);
  const dataFim = parseDate(body.data_fim);
  const clienteId = parseId(body.clienteId);

  if (!dataInicio || !dataFim) {
    response.status(400).json({ error: "Datas do contrato inválidas" });
    return;
  }

  if (dataFim < dataInicio) {
    response.status(400).json({
      error: "A data de fim deve ser igual ou posterior à data de início",
    });
    return;
  }

  if (!clienteId) {
    response.status(400).json({ error: "ID de cliente inválido" });
    return;
  }

  try {
    const contrato = await criarContrato({
      numero_contrato: String(body.numero_contrato).trim(),
      data_inicio: dataInicio,
      data_fim: dataFim,
      clienteId,
      status: body.status ? String(body.status).trim() : undefined,
    });

    response.status(201).json(contrato);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        response
          .status(409)
          .json({ error: "Número de contrato já cadastrado" });
        return;
      }

      if (error.code === "P2003") {
        response.status(404).json({ error: "Cliente não encontrado" });
        return;
      }
    }

    response.status(500).json({
      error: "Não foi possível cadastrar o contrato",
    });
  }
}

export async function getContrato(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de contrato inválido" });
    return;
  }

  const contrato = await buscarContratoPorId(id);

  if (!contrato) {
    response.status(404).json({ error: "Contrato não encontrado" });
    return;
  }

  response.status(200).json(contrato);
}

export async function patchContrato(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de contrato inválido" });
    return;
  }

  const contratoAtual = await buscarContratoPorId(id);

  if (!contratoAtual) {
    response.status(404).json({ error: "Contrato não encontrado" });
    return;
  }

  const body = request.body as Record<string, unknown>;
  const allowedFields = [
    "numero_contrato",
    "data_inicio",
    "data_fim",
    "clienteId",
    "status",
  ];
  const providedFields = allowedFields.filter((field) => field in body);

  if (providedFields.length === 0) {
    response
      .status(400)
      .json({ error: "Nenhum campo válido para atualização" });
    return;
  }

  const updateData: Prisma.ContratoUpdateInput = {};
  const dataInicio =
    "data_inicio" in body
      ? parseDate(body.data_inicio)
      : contratoAtual.data_inicio;
  const dataFim =
    "data_fim" in body ? parseDate(body.data_fim) : contratoAtual.data_fim;

  if (!dataInicio || !dataFim) {
    response.status(400).json({ error: "Datas do contrato inválidas" });
    return;
  }

  if (dataFim < dataInicio) {
    response.status(400).json({
      error: "A data de fim deve ser igual ou posterior à data de início",
    });
    return;
  }

  if ("numero_contrato" in body && body.numero_contrato !== "") {
    updateData.numero_contrato = String(body.numero_contrato).trim();
  }

  if ("data_inicio" in body) {
    updateData.data_inicio = dataInicio;
  }

  if ("data_fim" in body) {
    updateData.data_fim = dataFim;
  }

  if ("status" in body && body.status !== "") {
    updateData.status = String(body.status).trim();
  }

  if ("clienteId" in body) {
    const clienteId = parseId(body.clienteId);

    if (!clienteId) {
      response.status(400).json({ error: "ID de cliente inválido" });
      return;
    }

    updateData.cliente = { connect: { id: clienteId } };
  }

  try {
    const contrato = await atualizarContrato(id, updateData);
    response.status(200).json(contrato);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response
          .status(404)
          .json({ error: "Contrato ou cliente não encontrado" });
        return;
      }

      if (error.code === "P2002") {
        response
          .status(409)
          .json({ error: "Número de contrato já cadastrado" });
        return;
      }
    }

    response
      .status(500)
      .json({ error: "Não foi possível atualizar o contrato" });
  }
}

export async function deleteContrato(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de contrato inválido" });
    return;
  }

  try {
    await removerContrato(id);
    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Contrato não encontrado" });
        return;
      }

      if (error.code === "P2003") {
        response.status(409).json({
          error: "Contrato possui rotas ou fretes e não pode ser removido",
        });
        return;
      }
    }

    response.status(500).json({ error: "Não foi possível remover o contrato" });
  }
}
