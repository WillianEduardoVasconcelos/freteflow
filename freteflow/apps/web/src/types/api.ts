export type Vehicle = {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  categoria: string;
  capacidade_peso?: number | null;
  capacidade_volume?: number | null;
  status: string;
};

export type Driver = {
  id: number;
  nome: string;
  numero_cnh: string;
  validade_cnh: string;
  status: string;
  veiculos: Vehicle[];
};

export type Client = {
  id: number;
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  status: string;
};

export type Contract = {
  id: number;
  numero_contrato: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  clienteId: number;
  cliente?: Client;
};

export type FreightStatus =
  | "pendente"
  | "em_transito"
  | "entregue"
  | "cancelado";

export type Freight = {
  id: number;
  numero_frete: string;
  origem: string;
  destino: string;
  peso_kg?: number | null;
  volume_m3?: number | null;
  valor_frete: string | number;
  status: FreightStatus;
  previsao_entrega?: string | null;
  clienteId: number;
  contratoId: number;
  veiculoId: number;
  motoristaId?: number | null;
  cliente?: Client;
  contrato?: Contract;
  veiculo?: Vehicle;
  motorista?: Driver | null;
};

export type TrackingPoint = {
  id: number;
  latitude: string | number;
  longitude: string | number;
  velocidade_kmh?: number | null;
  registrado_em: string;
};

export type Occurrence = {
  id: number;
  tipo: string;
  descricao: string;
  status: string;
  ocorrido_em: string;
  resolucao?: string | null;
};
