import type { Request, Response } from "express";
import {
  criarDocumento,
  DocumentoError,
  listarDocumentos,
} from "../services/documento.service.js";

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function postDocumento(request: Request, response: Response) {
  try {
    const documento = await criarDocumento(request.body);
    response.status(201).json(documento);
  } catch (error) {
    if (error instanceof DocumentoError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível registrar o documento" });
  }
}

export async function getDocumentos(request: Request, response: Response) {
  const freteId = parseId(request.params.freteId);

  if (!freteId) {
    response.status(400).json({ error: "ID de frete inválido" });
    return;
  }

  try {
    const documentos = await listarDocumentos(freteId);
    response.status(200).json(documentos);
  } catch (error) {
    if (error instanceof DocumentoError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response
      .status(500)
      .json({ error: "Não foi possível consultar os documentos" });
  }
}
