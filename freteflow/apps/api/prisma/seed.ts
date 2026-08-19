import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cliente = await prisma.cliente.upsert({
    where: { documento: "00000000000100" },
    update: {},
    create: {
      nome: "Cliente Demonstração Ltda.",
      documento: "00000000000100",
      email: "contato@cliente-demo.local",
      telefone: "11999990000",
    },
  });

  const motorista = await prisma.motorista.upsert({
    where: { numero_cnh: "00000000000" },
    update: {},
    create: {
      nome: "Motorista Demonstração",
      numero_cnh: "00000000000",
      validade_cnh: new Date("2030-12-31"),
    },
  });

  const veiculo = await prisma.veiculo.upsert({
    where: { placa: "ABC1D23" },
    update: {},
    create: {
      placa: "ABC1D23",
      modelo: "Cargo 2429",
      marca: "Ford",
      ano_fabricacao: 2024,
      cor: "Branco",
      chassis: "9BF00000000000001",
      categoria: "caminhao",
      tipo_combustivel: "diesel",
      capacidade_tanque: 275,
      capacidade_peso: 14000,
      capacidade_volume: 45,
      quilometragem: 1000,
    },
  });

  await prisma.veiculo.update({
    where: { id: veiculo.id },
    data: { motoristas: { connect: { id: motorista.id } } },
  });

  await prisma.contrato.upsert({
    where: { numero_contrato: "CONTRATO-DEMO-001" },
    update: {},
    create: {
      numero_contrato: "CONTRATO-DEMO-001",
      data_inicio: new Date("2026-01-01"),
      data_fim: new Date("2026-12-31"),
      clienteId: cliente.id,
    },
  });

  console.log(
    "Seed concluído: cliente, motorista, veículo e contrato criados.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
