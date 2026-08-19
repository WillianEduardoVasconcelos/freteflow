import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  atualizarVeiculo,
  buscarVeiculoPorId,
  criarVeiculo,
  listarVeiculos,
  removerVeiculo,
} from "../services/veiculo.service.js";

const requiredFields = [
  "placa",
  "modelo",
  "marca",
  "ano_fabricacao",
  "cor",
  "chassis",
  "categoria",
  "tipo_combustivel",
  "capacidade_tanque",
];

function isMissing(value: unknown) {
  return value === undefined || value === null || value === "";
}

function parseVehicleId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getVeiculos(_request: Request, response: Response) {
  const veiculos = await listarVeiculos();
  response.status(200).json(veiculos);
}

export async function postVeiculo(request: Request, response: Response) {
  const body = request.body as Record<string, unknown>;
  const missingFields = requiredFields.filter((field) =>
    isMissing(body[field]),
  );

  if (missingFields.length > 0) {
    response.status(400).json({
      error: "Campos obrigatórios ausentes",
      fields: missingFields,
    });
    return;
  }

  const numericFields = [
    "ano_fabricacao",
    "capacidade_tanque",
    "capacidade_peso",
    "capacidade_volume",
    "quilometragem",
  ];
  const invalidNumericFields = numericFields.filter((field) => {
    if (isMissing(body[field])) {
      return false;
    }

    return !Number.isFinite(Number(body[field]));
  });

  if (invalidNumericFields.length > 0) {
    response.status(400).json({
      error: "Campos numéricos inválidos",
      fields: invalidNumericFields,
    });
    return;
  }

  try {
    const veiculo = await criarVeiculo({
      placa: String(body.placa).trim().toUpperCase(),
      modelo: String(body.modelo).trim(),
      marca: String(body.marca).trim(),
      ano_fabricacao: Number(body.ano_fabricacao),
      cor: String(body.cor).trim(),
      chassis: String(body.chassis).trim(),
      categoria: String(body.categoria).trim(),
      tipo_combustivel: String(body.tipo_combustivel).trim(),
      capacidade_tanque: Number(body.capacidade_tanque),
      capacidade_peso: isMissing(body.capacidade_peso)
        ? undefined
        : Number(body.capacidade_peso),
      capacidade_volume: isMissing(body.capacidade_volume)
        ? undefined
        : Number(body.capacidade_volume),
      quilometragem: isMissing(body.quilometragem)
        ? undefined
        : Number(body.quilometragem),
    });

    response.status(201).json(veiculo);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      response.status(409).json({
        error: "Placa ou chassi já cadastrado",
      });
      return;
    }

    response.status(500).json({
      error: "Não foi possível cadastrar o veículo",
    });
  }
}

export async function getVeiculo(request: Request, response: Response) {
  const id = parseVehicleId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de veículo inválido" });
    return;
  }

  const veiculo = await buscarVeiculoPorId(id);

  if (!veiculo) {
    response.status(404).json({ error: "Veículo não encontrado" });
    return;
  }

  response.status(200).json(veiculo);
}

export async function patchVeiculo(request: Request, response: Response) {
  const id = parseVehicleId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de veículo inválido" });
    return;
  }

  const body = request.body as Record<string, unknown>;
  const updateData: Prisma.VeiculoUpdateInput = {};
  const stringFields = [
    "placa",
    "modelo",
    "marca",
    "cor",
    "chassis",
    "categoria",
    "tipo_combustivel",
    "status",
  ];
  const numericFields = [
    "ano_fabricacao",
    "capacidade_tanque",
    "capacidade_peso",
    "capacidade_volume",
    "quilometragem",
  ];
  const allowedFields = [...stringFields, ...numericFields];
  const providedFields = allowedFields.filter((field) => field in body);

  if (providedFields.length === 0) {
    response
      .status(400)
      .json({ error: "Nenhum campo válido para atualização" });
    return;
  }

  const invalidNumericFields = numericFields.filter((field) => {
    if (!(field in body) || isMissing(body[field])) {
      return false;
    }

    return !Number.isFinite(Number(body[field]));
  });

  if (invalidNumericFields.length > 0) {
    response.status(400).json({
      error: "Campos numéricos inválidos",
      fields: invalidNumericFields,
    });
    return;
  }

  for (const field of stringFields) {
    if (field in body && !isMissing(body[field])) {
      updateData[field] = String(body[field]).trim();
    }
  }

  if ("placa" in body && !isMissing(body.placa)) {
    updateData.placa = String(body.placa).trim().toUpperCase();
  }

  for (const field of numericFields) {
    if (field in body && !isMissing(body[field])) {
      updateData[field] = Number(body[field]);
    }
  }

  try {
    const veiculo = await atualizarVeiculo(id, updateData);
    response.status(200).json(veiculo);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Veículo não encontrado" });
        return;
      }

      if (error.code === "P2002") {
        response.status(409).json({ error: "Placa ou chassi já cadastrado" });
        return;
      }
    }

    response.status(500).json({
      error: "Não foi possível atualizar o veículo",
    });
  }
}

export async function deleteVeiculo(request: Request, response: Response) {
  const id = parseVehicleId(request.params.id);

  if (!id) {
    response.status(400).json({ error: "ID de veículo inválido" });
    return;
  }

  try {
    await removerVeiculo(id);
    response.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        response.status(404).json({ error: "Veículo não encontrado" });
        return;
      }

      if (error.code === "P2003") {
        response.status(409).json({
          error:
            "Veículo possui registros relacionados e não pode ser removido",
        });
        return;
      }
    }

    response.status(500).json({
      error: "Não foi possível remover o veículo",
    });
  }
}
