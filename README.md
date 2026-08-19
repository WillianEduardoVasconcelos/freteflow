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

## 2. Tecnologias Utilizadas (Foco em Portfólio / Open-Source)

### Front-end

| Tecnologia           | Versão | Justificativa                                                         |
| :------------------- | :----- | :-------------------------------------------------------------------- |
| **React + Vite**     | Latest | Biblioteca padrão para interfaces web com bundling ultrarrápido.      |
| **TypeScript**       | Latest | Tipagem forte para maior qualidade de código e prevenção de bugs.     |
| **Tailwind CSS**     | 4.x    | Estilização rápida e consistente, ideal para painéis administrativos. |
| **Zustand**          | Latest | Gerenciamento de estado global leve e simples.                        |
| **React Router DOM** | Latest | Gerenciamento de rotas e navegação protegida no painel.               |

### Back-end

| Tecnologia     | Versão   | Justificativa                                                       |
| :------------- | :------- | :------------------------------------------------------------------ |
| **Node.js**    | 20.x LTS | Runtime escalável, perfeito para APIs e rastreamento em tempo real. |
| **Express**    | Latest   | Framework minimalista e consolidado no mercado.                     |
| **Prisma ORM** | 7.9.1    | Abstração segura e moderna para interação com o banco de dados.     |

### Banco de Dados

| Tecnologia              | Versão | Justificativa                                                                          |
| :---------------------- | :----- | :------------------------------------------------------------------------------------- |
| **PostgreSQL**          | 18.x   | Banco relacional gratuito, executado localmente durante o desenvolvimento.             |
| **Supabase (opcional)** | Cloud  | Alternativa gratuita para desenvolvimento ou hospedagem, sujeita aos limites do plano. |

### Infraestrutura e DevOps

| Tecnologia         | Justificativa                                                                            |
| :----------------- | :--------------------------------------------------------------------------------------- |
| **Render**         | Hospedagem gratuita para o Back-end (Node.js). Faz o deploy automático direto do GitHub. |
| **Vercel**         | Hospedagem gratuita e otimizada para o Front-end (React/Vite).                           |
| **GitHub Actions** | Automação gratuita de CI/CD para repositórios open-source.                               |

---

## 3. Estrutura do Projeto (Monorepo)

```text
freteflow/
├── apps/
│   ├── web/              # Aplicação React + Vite (Front-end)
│   │   ├── src/
│   │   │   ├── api/      # Cliente HTTP configurado com credentials e CSRF
│   │   │   ├── store/    # Zustand auth store
│   │   │   ├── pages/    # Dashboard, Fretes, Veículos, Motoristas, Clientes
│   │   │   └── ...
│   └── api/              # API Express (Back-end)
│       ├── src/
│       │   ├── controllers/   # Controladores da API
│       │   ├── routes/        # Roteamento das rotas
│       │   ├── middleware/    # Auth, RBAC, Zod, Security, CSRF
│       │   ├── services/      # Lógica de negócio
│       │   └── config/        # Prisma, CSRF config
│       └── prisma/
│           ├── schema.prisma  # Schema do banco PostgreSQL
│           └── seed.ts        # Seed automatizado do Admin e Demo
├── package.json
└── README.md
```

### Estado atual do projeto

- PostgreSQL local configurado em `D:\bando de dados\PostgreSQL\18\data`.
- Banco `freteflow` criado e sincronizado com o Prisma.
- Prisma configurado em `prisma.config.ts`.
- Migrações em `apps/api/prisma/migrations/`.
- Seed inicial em `apps/api/prisma/seed.ts` (cria usuário admin, veículo, motorista, cliente e contrato de demonstração).
- Variáveis locais em `.env`; use `.env.example` como modelo e nunca versionar credenciais.
- API Express funcional em `apps/api/src/`.
- CRUD de veículos, motoristas, clientes e contratos implementado.
- Fretes implementados com validação de contrato, cliente, veículo, motorista e capacidade.
- Rastreamento, ocorrências e documentos vinculados a fretes implementados.
- Resolução de ocorrências disponível para perfis `admin` e `operador`.
- Autenticação com bcrypt, JWT, refresh token rotativo, 2FA TOTP e logout seguro.
- RBAC aplicado às rotas protegidas: `admin`, `operador` e `motorista`.
- Proteções HTTP com Helmet, CORS restritivo com `credentials: true`, rate limit, limite de payload e proteção CSRF (Double-submit token).
- Validação de entrada com Zod estrito e auditoria de eventos de segurança.
- Suíte de integração com 33 testes aprovados.
- **Front-end operacional integrado:** Telas completas de Login, Dashboard, Fretes, Veículos, Motoristas e Clientes rodando em `http://localhost:5173`.

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
- O `package.json` principal fica na raiz `freteflow/`.

Para validar o banco e rodar a aplicação localmente a partir da raiz `freteflow/`:

```powershell
# Executar seed do banco
npx tsx apps/api/prisma/seed.ts

# Iniciar Back-end (Terminal 1)
cd freteflow
npm run api:dev

# Iniciar Front-end (Terminal 2)
cd freteflow
npm run web:dev
```

Credenciais padrão geradas pelo seed:

- **E-mail:** `admin@freteflow.com`
- **Senha:** `Admin123!`

---

## 4. Regras de Negócio Principais

### RB-01 - Cadastro de Veículos

> Cada veículo deve ter registro único com: número da placa, chassi, modelo, ano, cor, categoria, status ativo/inativo, última revisão e documentos válidos.

### RB-02 - Motoristas Qualificados

> Todo motorista cadastrado deve possuir CNH válida e registro na plataforma.

### RB-03 - Gestão de Contratos

> Todo serviço de frete deve estar vinculado a um contrato ativo.

### RB-04 - Roteirização e Capacidade

> O sistema valida peso e volume contra a capacidade máxima do veículo.

### RB-05 - Controle de Fretes em Andamento

> Cada frete registra status, localização, motorista responsável e checkpoints.

### RB-09 - Gestão de Ocorrências

> Incidentes são registrados e podem ser marcados como `RESOLVIDA` por perfis autorizados (`admin` ou `operador`).

### RB-12 - Segurança e Conformidade

> Autenticação segura com JWT, Cookies HttpOnly, Proteção CSRF, Helmet, Rate Limiter e Zod.

---

## Próximos Passos

1. **Aprimorar operação**: adicionar atualização completa de ocorrências e armazenamento físico de anexos.
2. **Adicionar CI/CD gratuito**: configurar validação e testes no GitHub Actions.
3. **Preparar deploy**: documentar PostgreSQL local e alternativa Supabase/Render/Vercel.

---

**Autor**: Tech Lead  
**Data de Criação**: 2026-08-18  
**Última Atualização**: 2026-08-19  
**Versão**: 1.1.0
