# 📦 FreteFlow - Documentação do SaaS

### Funcionalidades Principais

- Gestão de frota (caminhões, veículos, motoristas)
- Planejamento e roteirização inteligente de rotas
- Rastreamento de entregas em tempo real
- Controle financeiro (faturamento, combustíveis, manutenção)
- Integração com sistemas de GPS e telemetria
- Relatórios gerenciais e dashboard analítico
- Gestão de clientes e contratos
- Notas fiscais e documentação

---

## 1. Resumo do Projeto

O FreteFlow visa transformar a operação logística das empresas, oferecendo uma solução cloud-native que substitui planilhas e sistemas legados por uma plataforma moderna, escalável e integrada.

### Público-Alvo

- Empresas de transporte rodoviário
- Distribuidoras de carga
- Transportadoras regionais e nacionais
- Agentes de carga
- Autocarretários

### Objetivos

- Reduzir custos operacionais em até 30%
- Aumentar a eficiência de rotas em 40%
- Melhorar o tempo médio de resposta do cliente
- Reduzir erros de documentação e faturamento
- Proporcionar visibilidade total da operação em tempo real

---

## 2. Tecnologias Sugeridas (Foco em Portfólio / Open-Source)

### Front-end

| Tecnologia       | Versão | Justificativa                                                         |
| ---------------- | ------ | --------------------------------------------------------------------- |
| **React + Vite** | Latest | Biblioteca padrão para interfaces web com bundling ultrarrápido.      |
| **TypeScript**   | Latest | Tipagem forte para maior qualidade de código e prevenção de bugs.     |
| **Tailwind CSS** | 3.x    | Estilização rápida e consistente, ideal para painéis administrativos. |
| **Zustand**      | Latest | Gerenciamento de estado global leve e simples.                        |

### Back-end

| Tecnologia     | Versão   | Justificativa                                                       |
| -------------- | -------- | ------------------------------------------------------------------- |
| **Node.js**    | 20.x LTS | Runtime escalável, perfeito para APIs e rastreamento em tempo real. |
| **Express**    | Latest   | Framework minimalista e consolidado no mercado.                     |
| **Prisma ORM** | 7.9.1    | Abstração segura e moderna para interação com o banco de dados.     |

### Banco de Dados

| Tecnologia              | Versão | Justificativa                                                                          |
| ----------------------- | ------ | -------------------------------------------------------------------------------------- |
| **PostgreSQL**          | 18.x   | Banco relacional gratuito, executado localmente durante o desenvolvimento.             |
| **Supabase (opcional)** | Cloud  | Alternativa gratuita para desenvolvimento ou hospedagem, sujeita aos limites do plano. |

### Infraestrutura e DevOps

| Tecnologia         | Justificativa                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Render**         | Hospedagem gratuita para o Back-end (Node.js). Faz o deploy automático direto do GitHub sem exigir cartão de crédito. |
| **Vercel**         | Hospedagem gratuita e otimizada para o Front-end (React/Vite).                                                        |
| **GitHub Actions** | Automação gratuita de CI/CD para repositórios open-source.                                                            |

### Integrações gratuitas ou open source

- **Mapas e Roteirização**: **OpenRouteService / OSRM** (Alternativas gratuitas ao Google Maps API).
- **Busca de Endereços**: **ViaCEP / Nominatim** (Preenchimento automático de localização sem custo).
- **Email**: **SendGrid** ou SMTP local (o plano gratuito pode ter limites e mudar).
- **Webhooks**: **BullMQ** (Processamento de filas em segundo plano rodando no próprio servidor).

## 3. Estrutura de Pastas Recomendada

```
freteflow/
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   └── ISSUE_TEMPLATE/     # Templates de issues e PRs
├── docs/                   # Documentação do projeto
│   ├── api/               # Documentação API
│   ├── architecture/      # Arquitetura e decisões técnicas
│   └── user-manual/       # Manual do usuário
├── apps/                  # Aplicações (multi-app ou monorepo)
│   ├── web/              # Aplicação React principal
│   ├── api/              # API Express/Fastify
│   ├── admin/            # Painel administrativo
│   └── mobile/           # App móvel futuro
├── packages/              # Compartilhado entre apps
│   ├── shared-types/     # Tipagens TypeScript compartilhadas
│   ├── components/       # Componentes reutilizáveis
│   ├── config/           # Configurações compartilhadas
│   └── utils/            # Utilitários e helpers
├── scripts/               # Scripts de automação
│   ├── seed.ts           # Seed do banco de dados
│   └── migrate.sh        # Scripts de migração
├── docker/                # Docker configs
│   ├── compose.yml       # Docker Compose para desenvolvimento
│   └── k8s/              # Configurações Kubernetes
└── terraform/            # IaC (opcional)

# Estrutura simplificada para início:
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── FRET Flow_SaaS.md      # ← Este arquivo
│   └── API_DOCS.md
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/    # Componentes React
│   │   │   ├── pages/         # Páginas da aplicação
│   │   │   ├── hooks/         # Hooks personalizados
│   │   │   ├── services/      # Serviços (API calls)
│   │   │   ├── store/         # Estado global
│   │   │   └── utils/         # Utilitários
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/
│       ├── src/
│       │   ├── controllers/   # Controladores da API
│       │   ├── routes/        # Roteamento das rotas
│       │   ├── middleware/    # Middleware (auth, validação)
│       │   ├── services/      # Lógica de negócio
│       │   ├── models/        # Modelos Prisma
│       │   ├── utils/         # Helpers da API
│       │   └── config/        # Configurações
│       ├── prisma/
│       │   ├── schema.prisma  # Schema do banco
│       │   └── seed.ts
│       ├── package.json
│       └── tsconfig.json

# Exemplo de componentes específicos:
apps/web/src/
├── components/
│   ├── ui/                  # Componentes base (botões, inputs)
│   ├── layouts/             # Layouts das páginas
│   ├── dashboard/           # Componentes do dashboard
│   ├── frotas/              # Componentes de gestão de frota
│   ├── rotas/               # Componentes de roteirização
│   └── financeiro/          # Componentes financeiros
├── pages/
│   ├── login.tsx
│   ├── cadastro/            # Cadastro de veículos, motoristas
│   ├── dashboards/          # Dashboards
│   ├── frota/               # Gestão de frota
│   ├── rotas/               # Planejamento de rotas
│   └── financeiro/          # Relatórios financeiros
├── services/
│   ├── auth.service.ts
│   ├── veiculo.service.ts
│   ├── rota.service.ts
│   ├── frete.service.ts
│   └── relatorio.service.ts
└── store/
    ├── auth.store.ts
    ├── frota.store.ts
    └── rota.store.ts

```

### Estado atual do projeto

- PostgreSQL local configurado em `D:\bando de dados\PostgreSQL\18\data`.
- Banco `freteflow` criado e sincronizado com o Prisma.
- Prisma configurado em `prisma.config.ts`.
- Migrações em `apps/api/prisma/migrations/`.
- Seed inicial em `apps/api/prisma/seed.ts`.
- Variáveis locais em `.env`; use `.env.example` como modelo e nunca versionar credenciais.
- API Express funcional em `apps/api/src/`.
- CRUD de veículos, motoristas, clientes e contratos implementado.
- Fretes implementados com validação de contrato, cliente, veículo, motorista e capacidade.
- Rastreamento, ocorrências e documentos vinculados a fretes implementados.
- Resolução de ocorrências disponível para perfis `admin` e `operador`.
- Autenticação com bcrypt, JWT, refresh token rotativo, 2FA TOTP e logout seguro.
- RBAC aplicado às rotas protegidas: `admin`, `operador` e `motorista`.
- Proteções HTTP com Helmet, CORS restritivo, rate limit, limite de payload e CSRF.
- Validação de entrada com Zod estrito e auditoria de eventos de segurança.
- Suíte de integração com 33 testes aprovados.

### Endpoints principais

- `GET /health`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`
- `/api/vehicles`
- `/api/drivers`
- `/api/clients`
- `/api/contracts`
- `/api/freights`
- `/api/tracking`
- `/api/occurrences`
- `/api/documents`

As rotas de domínio exigem Bearer token. O refresh e o logout também exigem o header `X-CSRF-Token`.

### Convenções atuais

- Status de frete: `pendente`, `em_transito`, `entregue` e `cancelado`.
- Status de ocorrência resolvida: `RESOLVIDA`.
- Documentos são registrados por URL; upload físico de anexos ainda não foi implementado.
- O `package.json` principal fica na raiz `freteflow/`; não há um `package.json` separado em `apps/api/`.

Para validar o banco, execute os comandos a partir da raiz `freteflow/`:

```powershell
npm run prisma:validate
npx prisma migrate status
npm run prisma:seed
```

---

## 4. Regras de Negócio Principais

### RB-01 - Cadastro de Veículos

> Cada veículo deve ter registro único com: número da placa, chassi, modelo, ano, cor, categoria (caminhão, carreta, moto), status ativo/inativo, última revisão e documentos válidos.

### RB-02 - Motoristas Qualificados

> Todo motorista cadastrado deve possuir CNH válida dentro do prazo de validade e registro na plataforma. Cada veículo pode estar associado a múltiplos motoristas que possuem permissão para dirigir aquele equipamento específico.

### RB-03 - Gestão de Contratos

> Todo serviço de frete deve estar vinculado a um contrato ativo. O sistema não pode emitir faturas ou processar pagamentos quando o contrato está vencido, suspenso ou em processo de rescisão.

### RB-04 - Roteirização Inteligente

> O sistema deve calcular rotas otimizadas considerando:
>
> - Pontos de origem e destino
> - Restrições de trânsito (horários proibidos)
> - Capacidade dos veículos (peso/volume)
> - Janelas de tempo para entregas
> - Combustível e custos operacionais
>   **Regra**: O sistema nunca pode sugerir rotas que excedam a capacidade do veículo ou o prazo do contrato.

### RB-05 - Controle de Fretes em Andamento

> Cada frete deve registrar: status (`em_transito`, `entregue`, `pendente`), localização GPS atual, motorista responsável, data/hora estimada e real de chegada, documentação anexada e eventuais ocorrências.

### RB-06 - Registro de Combustível

> É obrigatório registrar abastecimentos com: tipo de combustível, quilometragem, quantidade consumida, local e data do posto, preço pago por litro/km. O sistema deve calcular automaticamente o custo médio por km e alertar sobre variações significativas (+/- 15%).

### RB-07 - Manutenção Preventiva

> Todo veículo possui um cronograma de manutenção preventiva (óleo, filtros, revisões) com base na quilometragem ou tempo. O sistema deve gerar alertas automáticos quando o próximo serviço estiver próximo e bloquear emissão de faturas se a manutenção estiver em aberto.

### RB-08 - Relatórios Financeiros

> Todo frete entregue deve gerar relatório financeiro incluindo: valor do frete, custo do combustível, taxa de pedágio, horas do motoristas, multas, eventuais bonificações. O sistema deve calcular automaticamente a rentabilidade por rota e veículo.

### RB-09 - Gestão de Ocorrências

> Qualquer incidente (acidente, atraso não programado, extravio de carga) deve ser registrado no sistema com: data/hora, descrição, documentos/comprovantes, impacto financeiro estimado e status da solução proposta. Ocorrências podem ser marcadas como `RESOLVIDA` por `admin` ou `operador`.

### RB-10 - Condição para Cancelamento de Fretes

> Fretes podem ser cancelados apenas quando: (a) o veículo não foi despachado ainda ou (b) a taxa de cancelamento aplicável está dentro dos limites contratuais. O sistema deve calcular automaticamente eventuais penalidades.

### RB-11 - Notificações em Tempo Real

> O sistema deve enviar notificações automáticas via push, SMS ou email quando: motorista iniciar viagem, veículo passar por checkpoint importante, ocorrer evento de segurança, ou surgir problema no transporte.

### RB-12 - Segurança e Conformidade

> Todo usuário do sistema deve realizar autenticação segura (OAuth2/JWT), com sessões que expiram após inatividade. O acesso administrativo requer verificação em dois fatores para ações sensíveis (cancelamento de contratos, alterações financeiras).

---

## Próximos Passos

1. **Revisar dependências**: acompanhar as vulnerabilidades transitivas do Prisma 7 sem aplicar downgrade forçado.
2. **Aprimorar operação**: adicionar atualização completa de ocorrências, anexos físicos e notificações.
3. **Criar o front-end**: iniciar React + Vite com login, dashboard e tela de veículos.
4. **Integrar o front-end à API**: consumir autenticação, CRUDs, fretes e rastreamento.
5. **Adicionar CI/CD gratuito**: configurar validação e testes no GitHub Actions.
6. **Preparar deploy**: documentar PostgreSQL local e alternativa Supabase gratuita.

---

**Autor**: Tech Lead
**Data de Criação**: 2026-08-18
**Última Atualização**: 2026-08-18
**Versão**: 1.0.0
