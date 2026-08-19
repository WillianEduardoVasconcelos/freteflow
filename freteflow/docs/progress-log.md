# FreteFlow - Registro de Progresso

## 2026-08-18

### Banco de dados e ambiente

- PostgreSQL 18 instalado e executando localmente no Windows.
- Serviço PostgreSQL confirmado como ativo na porta `5432`.
- Diretório físico do banco identificado em `D:\bando de dados\PostgreSQL\18\data`.
- Banco `freteflow` criado e acessível localmente.
- Arquivo `.env` criado na raiz do projeto.
- Credenciais não são registradas neste documento.
- `.env.example` criado como modelo sem credenciais reais.
- `.gitignore` configurado para não versionar arquivos `.env`.

### Prisma

- Schema Prisma reorganizado e ampliado.
- Modelos criados para veículos, motoristas, clientes, contratos, rotas, fretes, abastecimentos, manutenções, rastreamento, ocorrências, documentos, financeiro, usuários e notificações.
- Prisma atualizado/configurado na versão `7.9.1`.
- `prisma.config.ts` criado para carregar o schema e `DATABASE_URL`.
- Adapter PostgreSQL configurado para o Prisma 7.
- Migração inicial criada e aplicada em `apps/api/prisma/migrations/`.
- Prisma Client gerado com sucesso.
- `prisma validate` executado com sucesso.
- `prisma migrate status` confirmou que o banco está sincronizado.

### Seed

- Seed criado em `apps/api/prisma/seed.ts`.
- Seed inclui cliente, motorista, veículo e contrato de demonstração.
- Seed executado com sucesso.
- Seed executado duas vezes para confirmar que não duplica registros.

### API mínima

- Express instalado.
- `apps/api/src/app.ts` criado.
- `apps/api/src/server.ts` criado.
- Script `npm run api:dev` adicionado ao `package.json`.
- Rota `GET /health` criada.
- Rota `/health` testada com resposta HTTP `200`.
- Rota `/health` passou a verificar a conexão real com PostgreSQL.
- Resposta da API confirmou `database: "ok"`.

### API e veículos

- Conexão reutilizável do Prisma criada em `apps/api/src/config/prisma.ts`.
- Rota `/health` passou a verificar a conexão real com o PostgreSQL.
- Service de veículos criado em `apps/api/src/services/veiculo.service.ts`.
- Controller de veículos criado em `apps/api/src/controllers/veiculo.controller.ts`.
- Rotas de veículos criadas em `apps/api/src/routes/veiculo.routes.ts`.
- `GET /api/vehicles` implementado para listagem.
- `POST /api/vehicles` implementado para cadastro.
- Validação de campos obrigatórios adicionada.
- Conflitos de placa ou chassi retornam `409 Conflict`.
- Cadastro válido, payload incompleto e listagem testados com sucesso.
- `GET /api/vehicles/:id` implementado para consulta individual.
- `PATCH /api/vehicles/:id` implementado para atualização parcial.
- `DELETE /api/vehicles/:id` implementado para remoção.
- IDs inválidos retornam `400` e registros inexistentes retornam `404`.
- Veículos relacionados a outros registros são protegidos contra remoção indevida.
- CRUD completo testado com sucesso usando um registro temporário, que foi removido ao final.

### Testes de veículos

- Teste de integração criado em `apps/api/src/veiculo.test.ts`.
- `supertest` adicionado como dependência de desenvolvimento.
- Script `npm test` adicionado ao `package.json`.
- Ciclo completo de cadastro, consulta, atualização, listagem e remoção testado.
- Validação de payload incompleto testada.
- Resultado: 2 testes aprovados e 0 falhas.

### API e motoristas

- Service de motoristas criado em `apps/api/src/services/motorista.service.ts`.
- Controller de motoristas criado em `apps/api/src/controllers/motorista.controller.ts`.
- Rotas de motoristas criadas em `apps/api/src/routes/motorista.routes.ts`.
- `GET /api/drivers` implementado para listagem.
- `POST /api/drivers` implementado para cadastro.
- Validação de campos obrigatórios e validade da CNH adicionada.
- Número de CNH duplicado retorna `409 Conflict`.
- Teste de cadastro/listagem e teste de data inválida adicionados.
- Resultado da suíte completa: 4 testes aprovados e 0 falhas.
- `GET /api/drivers/:id` implementado para consulta individual.
- `PATCH /api/drivers/:id` implementado para atualização parcial.
- `DELETE /api/drivers/:id` implementado para remoção.
- `POST /api/drivers/:id/vehicles/:vehicleId` implementado para associação.
- `DELETE /api/drivers/:id/vehicles/:vehicleId` implementado para desassociação.
- Motoristas listados com seus veículos associados.
- IDs inválidos, registros ausentes e CNH duplicada possuem respostas específicas.
- CRUD e associação testados com sucesso; dados temporários foram removidos.

### API e clientes

- Service de clientes criado em `apps/api/src/services/cliente.service.ts`.
- Controller de clientes criado em `apps/api/src/controllers/cliente.controller.ts`.
- Rotas de clientes criadas em `apps/api/src/routes/cliente.routes.ts`.
- `GET /api/clients` implementado para listagem.
- `POST /api/clients` implementado para cadastro.
- Validação de nome e documento obrigatórios adicionada.
- Documento duplicado retorna `409 Conflict`.
- Testes de cadastro, listagem, duplicidade e payload incompleto adicionados.
- Resultado da suíte completa: 7 testes aprovados e 0 falhas.
- `GET /api/clients/:id` implementado para consulta individual.
- `PATCH /api/clients/:id` implementado para atualização parcial.
- `DELETE /api/clients/:id` implementado para remoção.
- Clientes relacionados a contratos ou fretes são protegidos contra remoção indevida.
- Teste de consulta, atualização e remoção adicionado.
- Resultado da suíte completa: 8 testes aprovados e 0 falhas.

### API e contratos

- Service de contratos criado em `apps/api/src/services/contrato.service.ts`.
- Controller de contratos criado em `apps/api/src/controllers/contrato.controller.ts`.
- Rotas de contratos criadas em `apps/api/src/routes/contrato.routes.ts`.
- `GET /api/contracts` implementado para listagem com cliente relacionado.
- `POST /api/contracts` implementado para cadastro vinculado a cliente.
- Validação de campos obrigatórios, cliente e período do contrato adicionada.
- Datas invertidas retornam `400` e cliente inexistente retorna `404`.
- Testes de cadastro/listagem e datas invertidas adicionados.
- Resultado da suíte completa: 10 testes aprovados e 0 falhas.
- `GET /api/contracts/:id` implementado para consulta individual.
- `PATCH /api/contracts/:id` implementado para atualização parcial.
- `DELETE /api/contracts/:id` implementado para remoção.
- Atualizações preservam a validação do período do contrato.
- Contratos relacionados a rotas ou fretes são protegidos contra remoção indevida.
- Teste de consulta, atualização e remoção adicionado.
- Resultado da suíte completa: 11 testes aprovados e 0 falhas.

### Camada de segurança da API

- Middleware de segurança criado em `apps/api/src/middleware/security.middleware.ts`.
- Helmet adicionado para cabeçalhos HTTP de proteção.
- CORS restrito às origens definidas em `CORS_ORIGIN`.
- Rate limit adicionado com janela de 15 minutos e limite configurável por `RATE_LIMIT_MAX`.
- Payload JSON limitado a `100kb`.
- Handler de rota inexistente criado com resposta padronizada `404`.
- Handler global de erros criado sem exposição de stack trace.
- Testes de cabeçalhos, rota inexistente e JSON inválido adicionados.
- Resultado da suíte completa: 14 testes aprovados e 0 falhas.
- `RATE_LIMIT_MAX` documentado no `.env.example`.

### Autenticação segura

- Modelo `RefreshToken` adicionado ao schema Prisma.
- Migração `add_refresh_tokens` criada e aplicada.
- Prisma Client regenerado após a migração.
- bcryptjs configurado para comparação de senhas com hash e salt.
- Access token JWT configurado com validade de 15 minutos.
- Refresh token aleatório armazenado somente como hash no banco.
- Refresh token rotacionado e revogado após uso.
- Refresh token enviado em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção.
- Rotas `POST /api/auth/login`, `POST /api/auth/refresh` e `POST /api/auth/logout` criadas.
- Middleware `authenticate` criado para validar tokens Bearer.
- `JWT_SECRET` gerado localmente e configurado no `.env`; não foi registrado neste arquivo.
- Testes de login, renovação, logout e senha incorreta adicionados.
- Resultado da validação: schema válido, banco sincronizado e 16 testes aprovados.
- As rotas de domínio ainda não exigem autenticação; isso será aplicado junto ao RBAC.
- Campo `dois_fatores_secret` adicionado ao modelo `Usuario`.
- Migração `add_two_factor_secret` criada e aplicada.
- TOTP adicionado com setup autenticado em `POST /api/auth/2fa/setup`.
- Verificação autenticada criada em `POST /api/auth/2fa/verify`.
- Login passa a exigir `codigo2fa` quando o usuário ativa 2FA.
- Teste de setup, verificação, bloqueio sem código e login com código adicionado.
- Resultado da suíte completa após 2FA: 22 testes aprovados e 0 falhas.

### Autorização e RBAC

- Middleware `authorize` criado em `apps/api/src/middleware/auth.middleware.ts`.
- Rotas de clientes, contratos, motoristas e veículos protegidas por Bearer token.
- Perfis `admin` e `operador` autorizados nas áreas operacionais atuais.
- Perfil `motorista` bloqueado nas áreas administrativas com resposta `403`.
- Testes de acesso sem token e perfil sem permissão adicionados.
- Testes de domínio atualizados para usar tokens reais, sem bypass em ambiente de teste.
- Resultado da suíte completa: 18 testes aprovados e 0 falhas.

### Integridade de entrada

- Zod adicionado para validação de payloads.
- Schemas estritos criados em `apps/api/src/validation/schemas.ts`.
- Middleware `validateBody` criado em `apps/api/src/middleware/validation.middleware.ts`.
- Validação aplicada a veículos, motoristas, clientes, contratos e login.
- Campos desconhecidos são rejeitados com `.strict()`.
- Tipos, tamanhos, email, datas, IDs e capacidades são validados antes dos controllers.
- Testes de campos extras, capacidade negativa e email inválido adicionados.
- Prisma continua usando consultas parametrizadas, sem SQL concatenado.
- Resultado da suíte completa: 21 testes aprovados e 0 falhas.

### Auditoria de segurança

- Modelo `AuditLog` adicionado ao schema Prisma.
- Migração `add_audit_logs` criada e aplicada.
- Service de auditoria criado em `apps/api/src/services/audit.service.ts`.
- Login bem-sucedido e falho são registrados.
- Refresh, logout e eventos 2FA são registrados.
- Logs incluem ação, recurso, usuário, IP, User-Agent e metadata controlada.
- Senhas, access tokens, refresh tokens e segredos não são persistidos nos logs.
- Teste de auditoria de login criado.
- Resultado da suíte completa após auditoria: 23 testes aprovados e 0 falhas.

### Proteção CSRF

- Double-submit token implementado em `apps/api/src/config/csrf.ts`.
- Cookie CSRF separado criado sem `HttpOnly` para leitura pelo front-end.
- Comparação do cookie e header feita com `timingSafeEqual`.
- `POST /api/auth/refresh` exige `X-CSRF-Token`.
- `POST /api/auth/logout` exige `X-CSRF-Token`.
- Cookie CSRF é emitido no login e removido no logout.
- Testes de token ausente, token divergente e sessão completa adicionados.
- Resultado da suíte completa após CSRF: 25 testes aprovados e 0 falhas.

### API e Fretes

- Service criado em `apps/api/src/services/frete.service.ts`.
- Controller criado em `apps/api/src/controllers/frete.controller.ts`.
- Rotas criadas em `apps/api/src/routes/frete.routes.ts`.
- `GET /api/freights` implementado para listagem com relacionamentos.
- `POST /api/freights` implementado para cadastro.
- `GET /api/freights/:id` implementado para consulta individual.
- `PATCH /api/freights/:id` implementado para status, localização e previsão.
- Rotas de fretes protegidas por autenticação e RBAC.
- Validação Zod estrita adicionada para criação e atualização.
- Contrato precisa estar ativo, vigente e vinculado ao cliente informado.
- Cliente e veículo precisam estar ativos.
- Motorista informado precisa estar autorizado para o veículo.
- Peso e volume são verificados contra a capacidade do veículo.
- Mudança para `em_transito` registra despacho automaticamente.
- Mudança para `entregue` registra entrega automaticamente.
- Cancelamento bloqueado após despacho.
- Testes de criação, listagem, consulta, status, capacidade, cancelamento e campos extras adicionados.
- Resultado da suíte completa: 28 testes aprovados e 0 falhas.
- O driver `pg` emitiu um aviso de depreciação durante testes concorrentes, sem falhar os testes; deve ser acompanhado em atualização futura.

### Suporte operacional: Rastreamento, Ocorrências e Documentos

- Services criados para rastreamento, ocorrências e documentos.
- Controllers criados em `apps/api/src/controllers/`.
- Rotas criadas em `apps/api/src/routes/`.
- `POST /api/tracking` registra checkpoints para um frete e veículo válidos.
- `GET /api/tracking/:freteId` lista checkpoints de um frete.
- `POST /api/occurrences` registra ocorrências vinculadas a um frete.
- `GET /api/occurrences/:freteId` lista ocorrências do frete.
- `POST /api/documents` registra documentos fiscais/comprovantes por URL.
- `GET /api/documents/:freteId` lista documentos do frete.
- Todos os novos payloads usam schemas Zod estritos.
- Todos os Services validam a existência do `freteId`.
- Rastreamento valida correspondência entre frete e veículo.
- Documento valida ocorrência existente e pertencente ao mesmo frete.
- `admin` e `operador` podem consultar e gerenciar os módulos.
- `motorista` pode registrar checkpoints e ocorrências.
- `motorista` não pode gerenciar documentos e recebe `403`.
- Testes de vínculo, permissões, URL inválida e frete inexistente adicionados.
- Resultado da suíte completa: 31 testes aprovados e 0 falhas.
- O aviso de depreciação do driver `pg` continuou presente durante testes concorrentes, sem bloquear a suíte.
- `PATCH /api/occurrences/:id` implementado para resolução de ocorrências.
- Resolução exige `status: "RESOLVIDA"`, `resolucao` e `resolvido_em`.
- Apenas `admin` e `operador` podem resolver ocorrências.
- Perfil `motorista` recebe `403 Forbidden` ao tentar resolver.
- Ocorrência inexistente retorna `404`.
- Status diferente de `RESOLVIDA` é rejeitado pelo schema Zod.
- Teste automatizado de resolução autorizada, bloqueio de motorista e status inválido adicionado.
- Resultado da suíte completa após resolução: 33 testes aprovados e 0 falhas.

### Atualização do README

- README alinhado ao estado atual da API e do banco.
- Segurança, autenticação, RBAC, Zod, auditoria e CSRF documentados.
- Fretes, rastreamento, ocorrências e documentos adicionados ao estado atual.
- Endpoints principais documentados.
- Convenções de status atualizadas para `em_transito` e `RESOLVIDA`.
- Próximos passos substituídos pelos itens reais antes do front-end.
- Suíte executada após a atualização: 33 testes aprovados e 0 falhas.

### Front-end inicial

- Aplicação React + Vite + TypeScript criada em `apps/web/`.
- Tailwind CSS configurado com `@tailwindcss/vite`.
- Zustand adicionado para estado de autenticação.
- Script `web:dev` adicionado ao `package.json` raiz.
- Script `web:build` adicionado ao `package.json` raiz.
- Variável `VITE_API_URL` documentada em `apps/web/.env.example`.
- Valor padrão da API configurado como `http://localhost:3000`.
- Cliente Fetch criado em `apps/web/src/api/client.ts`.
- Cliente usa `credentials: "include"` para cookies HttpOnly.
- Bearer token é injetado automaticamente no header `Authorization`.
- Header `X-CSRF-Token` é enviado para operações de autenticação que usam cookie.
- Store `auth.store.ts` criada com login, 2FA, refresh e logout.
- Tela de login responsiva criada em `apps/web/src/pages/Login.tsx`.
- Tela exibe erros de validação, credenciais e exigência de código 2FA.
- Build Vite validado com sucesso.
- Servidor local confirmado com HTTP `200` em `http://localhost:5173/`.
- O front-end ainda exibe um painel inicial simples após login; o dashboard operacional completo será a próxima etapa.
- Cookie CSRF ajustado para `Path=/`, permitindo leitura pelo front-end em `/` e envio correto do header `X-CSRF-Token`.
- Testes focados de autenticação/CSRF: 5 aprovados e 0 falhas.
- Build do front-end repetido após o ajuste: concluído com sucesso.

### Navegação e Dashboard web

- React Router DOM adicionado ao front-end.
- Layout protegido criado em `apps/web/src/components/AppLayout.tsx`.
- Sidebar responsiva criada com links para Dashboard, Fretes, Veículos, Motoristas, Clientes e Logout.
- Header criado com usuário autenticado e perfil atual.
- Rota `/login` conectada à área autenticada.
- Rotas `/` e `/dashboard` conectadas ao Dashboard.
- Placeholders de navegação criados para os módulos ainda não implementados no front-end.
- Dashboard criado em `apps/web/src/pages/Dashboard.tsx`.
- Cards de total de fretes, em trânsito, entregues e ocorrências abertas implementados.
- Lista dos últimos fretes criada com badges para `pendente`, `em_transito`, `entregue` e `cancelado`.
- Ação rápida permite avançar fretes de pendente para trânsito e de trânsito para entregue.
- Dashboard consome Fretes e Ocorrências pela API com autenticação existente.
- Build final: concluído com sucesso.
- Servidor Vite confirmado com HTTP `200` em `http://localhost:5173/`.

### Telas operacionais do Front-end

- Tela de veículos criada em `apps/web/src/pages/Vehicles.tsx`.
- Listagem de placa, modelo, categoria, capacidade e status implementada.
- Modal de cadastro de veículo conectado a `POST /api/vehicles`.
- Tela de motoristas criada em `apps/web/src/pages/Drivers.tsx`.
- Listagem de CNH, validade, status e veículos associados implementada.
- Modal de cadastro conectado a `POST /api/drivers`.
- Ações de vincular/desvincular veículo conectadas à API.
- Tela de clientes e contratos criada em `apps/web/src/pages/Clients.tsx`.
- Cards de clientes e contratos ativos implementados.
- Modais de cliente e contrato conectados a `POST /api/clients` e `POST /api/contracts`.
- Tela de Fretes criada em `apps/web/src/pages/Freights.tsx`.
- Filtros por `pendente`, `em_transito`, `entregue` e `cancelado` implementados.
- Modal de novo frete com seleção de cliente, contrato, veículo e motorista.
- Detalhes do frete exibem checkpoints e ocorrências.
- Ações rápidas de despacho e entrega conectadas ao backend.
- Rotas portuguesas conectadas: `/veiculos`, `/motoristas`, `/clientes` e `/fretes`.
- Componentes reutilizáveis de modal, estado, cabeçalho e ações de formulário criados.
- Build final: 56 módulos transformados sem erros.
- Diagnósticos TypeScript das telas: nenhum erro.
- Servidor Vite confirmado com HTTP `200`.
- Tipagem `vite/client` adicionada em `apps/web/src/vite-env.d.ts`.
- Corrigido o erro TypeScript `TS2339` em `import.meta.env` no cliente da API.
- Diagnósticos do editor: nenhum erro.
- Build Vite validado novamente com sucesso.

### Revisão de dependências

- `npm audit --omit=optional` executado sem alterar dependências.
- Foram encontradas 3 vulnerabilidades altas em `deepmerge-ts@7.1.5`.
- A dependência é transitiva de `prisma@7.9.1`, por meio de `@prisma/config`.
- A correção automática disponível exige `npm audit fix --force` e downgrade para Prisma 6.12.0.
- O downgrade não foi aplicado por ser uma alteração incompatível com a configuração atual do Prisma 7.
- Pendência: acompanhar uma atualização compatível do Prisma ou avaliar alternativa controlada após testes.

### Documentação

- README atualizado para refletir Prisma 7, PostgreSQL local, migrações e seed.
- Próximos passos do README reorganizados em etapas menores.
- Este arquivo criado para registrar o progresso técnico.

## 2026-08-19

### Build Standalone Android (EAS) e Integração de Ponta a Ponta

- **Configuração do Expo Application Services (EAS Build):**
  - Autenticação e vinculação do projeto móvel à conta Expo do desenvolvedor (`@willianeduardo/mobile`).
  - Configuração do identificador de pacote Android como `com.willianeduardo.mobile`.
  - Geração e gerenciamento da credencial de assinatura (Android Keystore) automatizada via nuvem da Expo.
- **Configuração do `eas.json`:**
  - Perfil `preview` configurado com `"buildType": "apk"` em `apps/mobile/eas.json` para geração de instalador direto independente da Google Play Store.
- **Compilação e Deploy em Nuvem:**
  - Compilação realizada com sucesso nos servidores remotos do EAS (`npx eas-cli build --platform android --profile preview`).
  - Pacote standalone `.apk` gerado, baixado e instalado com sucesso em dispositivo físico Android via QR Code.
- **Validação do Fluxo Operacional Ponta a Ponta:**
  - Login e autenticação no app mobile consumindo a API em produção no Render.
  - Envio de telemetria GPS a partir do celular com atualização instantânea na interface web.
  - Registro de ocorrência de rota pelo mobile persistido no banco e visualizado no painel administrativo.
  - Conclusão de entrega via app mobile com transição imediata do status para `ENTREGUE` na tabela web.

### Execução de Seed e Carga de Dados

- Script `apps/api/prisma/seed.ts` executado via `npx tsx apps/api/prisma/seed.ts` diretamente no workspace `freteflow/`.
- Carga de dados confirmada no PostgreSQL com usuário Admin (`admin@freteflow.com`), veículo de carga, motorista com CNH, cliente demo e contrato ativo.

### Resolução de CORS e Estabilização de Rede

- Identificado bloqueio de CORS no navegador para `POST /api/auth/login` (`Access-Control-Allow-Credentials: true` ausente durante requisições com cookies/credentials `include`).
- `apps/api/src/middleware/security.middleware.ts` atualizado:
  - Adicionado `credentials: true` explícito na configuração do pacote `cors`.
  - Configurados métodos HTTP autorizados (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`).
  - Liberados cabeçalhos essenciais de segurança (`Content-Type`, `Authorization`, `X-CSRF-Token`, `x-csrf-token`).
  - Ordem dos middlewares ajustada: `cors` reposicionado no topo da cadeia para responder requisições de preflight (`OPTIONS`) antes da filtragem do `helmet` e do `rateLimit`.
  - Configurado `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })`.

### Tipagens TypeScript da API

- Instalados os pacotes de definições de tipos `@types/express`, `@types/cookie-parser` e `@types/cors` como dependências de desenvolvimento no workspace da API.
- Erros de compilação `TS7016` (declarações de módulo ausentes) e `TS7006` (tipagem implícita `any` nos parâmetros `_request` e `response` na rota `/health`) solucionados.
- Servidor TypeScript do editor recarregado e diagnósticos limpos com zero erros.

### Integração Full-Stack e Validação Visual

- Servidor API (Express + Prisma) ativo em `http://localhost:3000`.
- Servidor Web (Vite + React) ativo em `http://localhost:5173`.
- Fluxo de autenticação testado com sucesso: login realizado com credenciais de administrador, geração de sessão JWT e persistência via cookies seguros.
- Tela **Dashboard** validada visualmente com exibição de métricas operacionais zeradas (carteira limpa).
- Tela **Clientes e Contratos** (`/clientes`) validada, renderizando com sucesso a empresa de demonstração e o contrato vinculado a partir do banco PostgreSQL.

### Módulo Mobile do Motorista (Expo & React Native)

- **Criação do pacote `apps/mobile`:** Inicialização do ecossistema mobile com Expo SDK 57 e TypeScript.
- **Portal do Motorista (Dark Mode):**
  - Tela de autenticação com tratamento de sessão e fallback para demonstração.
  - Painel de visualização da rota ativa (Origem, Destino, Carga, Peso e Placa do Veículo).
  - Ação de **Check-in GPS** com registro de timestamp em tempo real.
  - Disparo de **Registro de Ocorrências** para incidentes de trânsito e rotas.
  - Finalização operacional de frete com atualização dinâmica do badge para `ENTREGUE`.
- **Suporte Multiplataforma:** Configuração de dependências (`react-native-web`, `react-dom`, `@expo/metro-runtime`) permitindo execução em emulador mobile, celular físico (Expo Go) e navegador.
- **Scripts:** Adicionado script `"mobile:dev"` no `package.json` raiz do monorepo.

### Otimização e Estabilização do Fluxo de Fretes (Complemento)

- **Refatoração do Carregamento (`Freights.tsx`):**
  - Implementado carregamento em duas etapas no método `load()`: primeiro o essencial (fretes) para exibição imediata na tabela, e depois os dados auxiliares (clientes, contratos, veículos, drivers) para evitar bloqueio da interface.
  - O `setInterval` (polling) de 3 segundos foi removido para evitar estouro de limite de requisições (`429 Too Many Requests`) na API.
  - Implementado **carregamento sob demanda**: os dados da API são refrescados apenas no momento da abertura dos detalhes do frete ou após a criação de um novo registro.
  - Implementado **gatilho inteligente**: a função `quickStatus` agora chama `load(true)` automaticamente apenas quando o status é atualizado para `entregue`, garantindo que o registro mude de aba na interface web instantaneamente, sem necessidade de recarregamento manual (F5).

- **Resolução de Conflitos de Rede:**
  - Ajustada a estratégia de chamadas `Promise.all` para reduzir o volume de requisições simultâneas ao servidor Node.js/Prisma.
  - Validado que o estado da aplicação React agora reflete corretamente a mudança de status, com re-renderização garantida pelos `states` locais após a confirmação da `PATCH` na API.

- **Status da Operação:**
  - O sistema encontra-se estável, sem quedas de conexão ou erros de `rate limit`.
  - O fluxo **Mobile (App) -> API -> Web (Dashboard)** está validado e sincronizado operacionalmente.

### Customização Visual e Estabilização do App Mobile

- Atualizado `apps/mobile/app.json` com nome oficial **FreteFlow**, tema escuro e ícones adaptativos Android.
- Solucionada pendência de assets no prebuild (`adaptive-icon.png`).
- Prebuild validado localmente com sucesso e novo build standalone (`.apk`) gerado via EAS Build.

## Próximas etapas

1. Realizar a simulação de ciclo de vida completo de múltiplos fretes simultâneos (teste de carga/concorrência).
2. Configuração de pipeline CI/CD no GitHub Actions para validação e testes automatizados a cada push.
3. Acompanhar atualizações de dependências do Prisma 7 referentes ao alerta do `deepmerge-ts`.

## Observações

- O projeto deve continuar usando ferramentas gratuitas ou open source.
- Os comandos Prisma e scripts npm devem ser executados a partir do diretório `freteflow/`.
- O arquivo `.env` nunca deve ser enviado ao GitHub ou compartilhado publicamente.
- As vulnerabilidades reportadas pelo `npm install` continuam sob monitoramento; a correção forçada com downgrade não foi executada para preservar a compatibilidade com o Prisma 7.

## Regra de acompanhamento

Toda alteração no projeto deve ser registrada neste arquivo, incluindo:

- Data e objetivo da alteração.
- Arquivos criados ou modificados.
- Comandos e testes executados.
- Resultado da validação.
- Pendências ou problemas encontrados.
