import { z } from "zod";

const idSchema = z.coerce.number().int().positive();
const dateSchema = z.coerce.date();

const vehicleFields = {
  placa: z.string().trim().min(1).max(10),
  modelo: z.string().trim().min(1).max(50),
  marca: z.string().trim().min(1).max(50),
  ano_fabricacao: z.coerce.number().int().min(1900).max(2100),
  cor: z.string().trim().min(1).max(20),
  chassis: z.string().trim().min(1).max(50),
  categoria: z.string().trim().min(1).max(30),
  tipo_combustivel: z.string().trim().min(1).max(15),
  capacidade_tanque: z.coerce.number().positive(),
  capacidade_peso: z.coerce.number().positive().optional(),
  capacidade_volume: z.coerce.number().positive().optional(),
  quilometragem: z.coerce.number().int().nonnegative().optional(),
};

export const vehicleCreateSchema = z.object(vehicleFields).strict();
export const vehicleUpdateSchema = z
  .object(vehicleFields)
  .partial()
  .extend({
    status: z.string().trim().min(1).max(10).optional(),
  })
  .strict();

const driverFields = {
  nome: z.string().trim().min(2).max(100),
  numero_cnh: z.string().trim().min(1).max(20),
  validade_cnh: dateSchema,
};

export const driverCreateSchema = z.object(driverFields).strict();
export const driverUpdateSchema = z
  .object(driverFields)
  .partial()
  .extend({
    status: z.string().trim().min(1).max(10).optional(),
  })
  .strict();

const clientFields = {
  nome: z.string().trim().min(2).max(120),
  documento: z.string().trim().min(1).max(20),
  email: z.string().trim().email().max(160).optional(),
  telefone: z.string().trim().max(30).optional(),
};

export const clientCreateSchema = z.object(clientFields).strict();
export const clientUpdateSchema = z
  .object(clientFields)
  .partial()
  .extend({
    status: z.string().trim().min(1).max(10).optional(),
  })
  .strict();

const contractFields = {
  numero_contrato: z.string().trim().min(1).max(50),
  data_inicio: dateSchema,
  data_fim: dateSchema,
  clienteId: idSchema,
  status: z.string().trim().min(1).max(20).optional(),
};

export const contractCreateSchema = z
  .object(contractFields)
  .strict()
  .refine((data) => data.data_fim >= data.data_inicio, {
    message: "A data de fim deve ser igual ou posterior à data de início",
    path: ["data_fim"],
  });
export const contractUpdateSchema = z.object(contractFields).partial().strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(160),
    senha: z.string().min(8).max(128),
    codigo2fa: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
  })
  .strict();

export const twoFactorCodeSchema = z
  .object({
    codigo2fa: z.string().regex(/^\d{6}$/),
  })
  .strict();

const freightStatusSchema = z.enum([
  "pendente",
  "em_transito",
  "entregue",
  "cancelado",
]);

const freightFields = {
  numero_frete: z.string().trim().min(1).max(50),
  origem: z.string().trim().min(1).max(255),
  destino: z.string().trim().min(1).max(255),
  peso_kg: z.coerce.number().positive().optional(),
  volume_m3: z.coerce.number().positive().optional(),
  valor_frete: z.coerce.number().positive(),
  previsao_entrega: dateSchema.optional(),
  veiculoId: idSchema,
  motoristaId: idSchema.optional(),
  contratoId: idSchema,
  clienteId: idSchema,
  rotaId: idSchema.optional(),
};

export const freteCreateSchema = z.object(freightFields).strict();
export const freteUpdateSchema = z
  .object({
    status: freightStatusSchema.optional(),
    localizacao_lat: z.coerce.number().min(-90).max(90).optional(),
    localizacao_lng: z.coerce.number().min(-180).max(180).optional(),
    previsao_entrega: dateSchema.optional(),
    motivo_cancelamento: z.string().trim().max(255).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização",
  });

const freteIdSchema = z.coerce.number().int().positive();

export const trackingCreateSchema = z
  .object({
    freteId: freteIdSchema,
    veiculoId: idSchema,
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    velocidade_kmh: z.coerce.number().nonnegative().optional(),
    registrado_em: dateSchema.optional(),
  })
  .strict();

export const occurrenceCreateSchema = z
  .object({
    freteId: freteIdSchema,
    tipo: z.string().trim().min(1).max(40),
    descricao: z.string().trim().min(1).max(1000),
    impacto_financeiro: z.coerce.number().nonnegative().optional(),
    ocorrido_em: dateSchema,
  })
  .strict();

export const occurrenceResolveSchema = z
  .object({
    status: z.literal("RESOLVIDA"),
    resolucao: z.string().trim().min(1).max(1000),
    resolvido_em: dateSchema,
  })
  .strict();

export const documentCreateSchema = z
  .object({
    freteId: freteIdSchema,
    nome: z.string().trim().min(1).max(160),
    tipo: z.string().trim().min(1).max(40),
    url: z.string().url().max(500),
    ocorrenciaId: idSchema.optional(),
  })
  .strict();
