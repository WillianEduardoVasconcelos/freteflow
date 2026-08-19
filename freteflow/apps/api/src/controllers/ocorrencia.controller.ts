import type { Request, Response } from "express";
import {
  criarOcorrencia,
  listarOcorrencias,
  OcorrenciaError,
  resolverOcorrencia,
} from "../services/ocorrencia.service.js";

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function postOcorrencia(request: Request, response: Response) {
  try {
    const ocorrencia = await criarOcorrencia(request.body);
    response.status(201).json(ocorrencia);
  } catch (error) {
    if (error instanceof OcorrenciaError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível registrar a ocorrência" });
  }
}

export async function getOcorrencias(request: Request, response: Response) {
  const freteId = parseId(request.params.freteId);

  if (!freteId) {
    response.status(400).json({ error: "ID de frete inválido" });
    return;
  }

  try {
    const ocorrencias = await listarOcorrencias(freteId);
    response.status(200).json(ocorrencias);
  } catch (error) {
    if (error instanceof OcorrenciaError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível consultar as ocorrências" });
  }
}

export async function patchOcorrencia(request: Request, response: Response) {
  const id = parseId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de ocorrência inválido" });
    return;
  }

  try {
    const ocorrencia = await resolverOcorrencia(id, request.body);
    response.status(200).json(ocorrencia);
  } catch (error) {
    if (error instanceof OcorrenciaError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível resolver a ocorrência" });
  }
}
