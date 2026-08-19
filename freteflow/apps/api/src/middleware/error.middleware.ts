import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: "Rota não encontrada",
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const knownError = error as { status?: number; statusCode?: number };
  const status = knownError.status ?? knownError.statusCode ?? 500;

  if (error instanceof SyntaxError) {
    response.status(400).json({
      error: "JSON da requisição inválido",
    });
    return;
  }

  response.status(status >= 400 && status < 600 ? status : 500).json({
    error: status === 500 ? "Erro interno do servidor" : "Requisição inválida",
  });
};
