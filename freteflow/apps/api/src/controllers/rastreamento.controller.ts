import type { Request, Response } from "express";
import {
  criarRastreamento,
  listarRastreamentos,
  RastreamentoError,
} from "../services/rastreamento.service.js";

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function postRastreamento(request: Request, response: Response) {
  try {
    const rastreamento = await criarRastreamento(request.body);
    response.status(201).json(rastreamento);
  } catch (error) {
    if (error instanceof RastreamentoError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível registrar o rastreamento" });
  }
}

export async function getRastreamentos(request: Request, response: Response) {
  const freteId = parseId(request.params.freteId);

  if (!freteId) {
    response.status(400).json({ error: "ID de frete inválido" });
    return;
  }

  try {
    const rastreamentos = await listarRastreamentos(freteId);
    response.status(200).json(rastreamentos);
  } catch (error) {
    if (error instanceof RastreamentoError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível consultar o rastreamento" });
  }
}
