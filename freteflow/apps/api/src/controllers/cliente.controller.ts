import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  atualizarCliente,
  buscarClientePorId,
  criarCliente,
  listarClientes,
  removerCliente,
} from "../services/cliente.service.js";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getClientes(_request: Request, response: Response) {
  const clientes = await listarClientes();
  response.status(200).json(clientes);
}

export async function postCliente(request: Request, response: Response) {
  const body = request.body as Record<string, unknown>;
  const requiredFields = ["nome", "documento"];
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

  try {
    const cliente = await criarCliente({
      nome: String(body.nome).trim(),
      documento: String(body.documento).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      telefone: body.telefone ? String(body.telefone).trim() : undefined,
    });

    response.status(201).json(cliente);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      response.status(409).json({
        error: "Documento já cadastrado",
      });
      return;
    }

    response.status(500).json({
      error: "Não foi possível cadastrar o cliente",
    });
  }
}

export async function getCliente(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de cliente inválido" });
    return;
  }

  const cliente = await buscarClientePorId(id);

  if (!cliente) {
    response.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  response.status(200).json(cliente);
}

export async function patchCliente(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de cliente inválido" });
    return;
  }

  const body = request.body as Record<string, unknown>;
  const allowedFields = ["nome", "documento", "email", "telefone", "status"];
  const providedFields = allowedFields.filter((field) => field in body);

  if (providedFields.length === 0) {
    response
      .status(400)
      .json({ error: "Nenhum campo válido para atualização" });
    return;
  }

  const updateData: Prisma.ClienteUpdateInput = {};

  for (const field of allowedFields) {
    if (field in body && body[field] !== "") {
      updateData[field] =
        body[field] === null ? null : String(body[field]).trim();
    }
  }

  try {
    const cliente = await atualizarCliente(id, updateData);
    response.status(200).json(cliente);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Cliente não encontrado" });
        return;
      }

      if (error.code === "P2002") {
        response.status(409).json({ error: "Documento já cadastrado" });
        return;
      }
    }

    response
      .status(500)
      .json({ error: "Não foi possível atualizar o cliente" });
  }
}

export async function deleteCliente(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de cliente inválido" });
    return;
  }

  try {
    await removerCliente(id);
    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Cliente não encontrado" });
        return;
      }

      if (error.code === "P2003") {
        response.status(409).json({
          error: "Cliente possui contratos ou fretes e não pode ser removido",
        });
        return;
      }
    }

    response.status(500).json({ error: "Não foi possível remover o cliente" });
  }
}
