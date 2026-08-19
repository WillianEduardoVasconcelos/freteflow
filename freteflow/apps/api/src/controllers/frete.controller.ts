import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  atualizarFrete,
  buscarFretePorId,
  criarFrete,
  FreteBusinessError,
  listarFretes,
} from "../services/frete.service.js";

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getFretes(_request: Request, response: Response) {
  const fretes = await listarFretes();
  response.status(200).json(fretes);
}

export async function getFrete(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de frete inválido" });
    return;
  }

  const frete = await buscarFretePorId(id);

  if (!frete) {
    response.status(404).json({ error: "Frete não encontrado" });
    return;
  }

  response.status(200).json(frete);
}

export async function postFrete(request: Request, response: Response) {
  try {
    const frete = await criarFrete(request.body);
    response.status(201).json(frete);
  } catch (error) {
    if (error instanceof FreteBusinessError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      response
        .status(400)
        .json({ error: "Dados relacionados do frete inválidos" });
      return;
    }

    response.status(500).json({ error: "Não foi possível cadastrar o frete" });
  }
}

export async function patchFrete(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de frete inválido" });
    return;
  }

  try {
    const frete = await atualizarFrete(id, request.body);
    response.status(200).json(frete);
  } catch (error) {
    if (error instanceof FreteBusinessError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response.status(500).json({ error: "Não foi possível atualizar o frete" });
  }
}
