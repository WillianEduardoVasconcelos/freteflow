# 📦 FreteFlow - Ecossistema de Gestão Logística e Transporte

> Solução full-stack e mobile cloud-native para gestão de frotas, despacho de fretes, auditoria operacional e telemetria em tempo real.

---

---

## 🌐 Acesso Rápido

- 🖥️ **Aplicação Web (Produção):** [https://freteflow-seven.vercel.app](https://freteflow-seven.vercel.app)
- ⚙️ **API Backend (Render):** [https://freteflow.onrender.com](https://freteflow.onrender.com)

---

## 🚀 Funcionalidades Principais

- **Painel de Gestão (Web):** Controle de frota (veículos, motoristas), clientes, contratos e despacho de fretes.
- **Portal do Motorista (Mobile):** Visualização de viagens ativas, despacho de telemetria/GPS, reporte de ocorrências e confirmação de entrega.
- **Rastreamento & Checkpoints:** Registro de posições geográficas e eventos da rota em tempo real.
- **Segurança & RBAC:** Controle de acesso granular por perfil (`admin`, `operador`, `motorista`), autenticação JWT com refresh token rotativo e proteção 2FA (TOTP).
- **Auditoria Operacional:** Registro e rastreamento de acessos e eventos críticos.
- **Gestão de Incidentes:** Abertura e resolução de ocorrências operacionais.

---

## 1. Resumo do Projeto

O **FreteFlow** substitui planilhas manuais e sistemas legados por uma plataforma integrada que conecta diretamente a **equipe de gestão no escritório** ao **motorista na estrada**.

### Público-Alvo

- Transportadoras e operadores logísticos
- Distribuidoras de carga
- Gestores de frota rodoviária
- Motoristas autônomos e frotistas

---

## 2. Tecnologias Utilizadas

### Front-end Web (Painel de Gestão)

| Tecnologia           | Versão | Justificativa                                                   |
| :------------------- | :----- | :-------------------------------------------------------------- |
| **React + Vite**     | Latest | Bundling ultrarrápido e arquitetura baseada em componentes.     |
| **TypeScript**       | Latest | Tipagem estática para robustez e manutenção do código.          |
| **Tailwind CSS**     | 4.x    | Estilização utilitária moderna para interfaces administrativas. |
| **Zustand**          | Latest | Gerenciamento de estado global leve e reativo.                  |
| **React Router DOM** | Latest | Roteamento com controle de rotas públicas e protegidas.         |

### Mobile (Portal do Motorista)

| Tecnologia           | Versão | Justificativa                                                     |
| :------------------- | :----- | :---------------------------------------------------------------- |
| **React Native**     | Latest | Desenvolvimento de interface nativa mobile com alto desempenho.   |
| **Expo**             | SDK 57 | Ecossistema moderno para testes rápidos e compilação de apps.     |
| **React Native Web** | Latest | Compatibilidade para execução instantânea no navegador e celular. |

### Back-end (API RESTful)

| Tecnologia     | Versão   | Justificativa                                              |
| :------------- | :------- | :--------------------------------------------------------- |
| **Node.js**    | 20.x LTS | Ambiente de execução assíncrono escalável.                 |
| **Express**    | Latest   | Framework minimalista e estável para APIs REST.            |
| **Prisma ORM** | 7.9.1    | Mapeamento relacional tipado com migrations automatizadas. |
| **Zod**        | Latest   | Validação rigorosa de esquemas e payloads HTTP.            |

### Banco de Dados & Infraestrutura

| Tecnologia          | Detalhes                                                   |
| :------------------ | :--------------------------------------------------------- |
| **PostgreSQL 18**   | Banco relacional com integridade referencial estrita.      |
| **Render**          | Hospedagem em nuvem gratuita para a API Node.js.           |
| **Vercel**          | Hospedagem de alta performance para a aplicação Web React. |
| **Supabase / Neon** | Instâncias gerenciadas de PostgreSQL na nuvem com SSL.     |

---

## 3. Estrutura do Monorepo

```text
freteflow/
├── apps/
│   ├── api/              # API Express (Back-end)
│   │   ├── prisma/       # Schema, migrações e seed
│   │   └── src/          # Controllers, routes, middleware (RBAC/Auth/Zod) e services
│   ├── web/              # Painel Web React + Vite (Gestão)
│   │   └── src/          # Pages (Dashboard, Fretes, Veículos, Clientes), api client e stores
│   └── mobile/           # App Mobile React Native + Expo (Motorista)
│       └── App.tsx       # Interface ergonômica com Check-in GPS e Ocorrências
├── docs/                 # Documentação técnica e progress-log
├── package.json          # Scripts centralizadores do monorepo
└── README.md
```

## 4. Estado Atual do Projeto

- **Banco de Dados:** PostgreSQL configurado e sincronizado via Prisma ORM com migrações aplicadas.
- **Seed Automatizado:** Carga inicial com usuário Administrador, veículo, motorista, cliente demo e contrato ativo.
- **Segurança Full-Stack:** Proteção com Helmet, CORS restrito com credenciais (`credentials: true`), Rate Limit, proteção CSRF (Double-Submit Token) e auditoria de eventos.
- **RBAC:** Perfis `admin` e `operador` autorizados na gestão; `motorista` restrito à telemetria e ocorrências.
- **Suíte de Testes:** 33 testes de integração automatizados aprovados.
- **Aplicações Operacionais:**
  - **Web:** Telas completas de Login, Dashboard com métricas, Fretes, Veículos, Motoristas e Clientes.
  - **Mobile:** App do motorista funcional com login, card de rota ativa, envio de check-in GPS e reporte de incidentes.

---

## 5. Como Executar o Projeto Localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 18 ativo
- Git

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone [https://github.com/WillianEduardoVasconcelos/freteflow.git](https://github.com/WillianEduardoVasconcelos/freteflow.git)
cd freteflow
npm install
```

# 2. Configurar o Banco de Dados e Executar o Seed

```bash
# Executa as migrações do Prisma
npx prisma migrate deploy

# Popula o banco com os dados iniciais de demonstração
npx tsx apps/api/prisma/seed.ts
```

### 3. Iniciar as Aplicações

Abra terminais separados na raiz do projeto (`freteflow/`):

```bash
# Terminal 1: Iniciar a API Express (Porta 3000)
npm run api:dev

# Terminal 2: Iniciar o Painel Web (Porta 5173)
npm run web:dev

# Terminal 3: Iniciar o App Mobile (Expo / Porta 8081)
npm run mobile:dev
```

> **Para testar o App Mobile:**
>
> - Pressione **`w`** no terminal do Expo para testar no navegador[cite: 6].
> - Ou escaneie o **QR Code** pelo app **Expo Go** no celular[cite: 6].

---

## 🔑 Credenciais Padrão de Acesso

| Perfil            | E-mail                | Senha       |
| :---------------- | :-------------------- | :---------- |
| **Administrador** | `admin@freteflow.com` | `Admin123!` |

---

## 6. Endpoints Principais da API

- **Autenticação & 2FA:** `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/2fa/setup`, `POST /api/auth/2fa/verify`[cite: 6]
- **Cadastros Operacionais:** `/api/vehicles`, `/api/drivers`, `/api/clients`, `/api/contracts`[cite: 6]
- **Logística & Fretes:** `/api/freights` (listagem, despacho e entrega)[cite: 6]
- **Telemetria & Operação:** `/api/tracking` (checkpoints GPS), `/api/occurrences` (registro/resolução), `/api/documents`[cite: 6]

---

## 7. Próximos Passos

1. **Deploy em Nuvem:** Hospedagem da API no Render, Web na Vercel e PostgreSQL gerenciado no Supabase/Neon[cite: 6].
2. **Integração em Tempo Real:** Conexão contínua do App Mobile enviando coordenadas geográficas reais para o Dashboard Web[cite: 6].
3. **CI/CD Automatizado:** Pipeline no GitHub Actions para validação e testes automáticos a cada commit[cite: 6].

---

**Autor:** Tech Lead[cite: 6]  
**Última Atualização:** 2026-08-19[cite: 6]  
**Versão:** 1.2.0[cite: 6]
