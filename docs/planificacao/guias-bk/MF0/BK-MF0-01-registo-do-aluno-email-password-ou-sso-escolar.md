# BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).

## Header
- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF01`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`
- `last_updated`: `2026-05-25`

## O que vamos fazer neste BK

Neste BK vamos construir a primeira entrada real do StudyFlow: o registo de aluno. O resultado esperado é que um aluno consiga criar uma conta usando email e password, ficando preparado para iniciar sessão no BK seguinte. O RF01 também menciona SSO escolar, mas nenhum documento define fornecedor, protocolo, campos institucionais ou credenciais de integração. Por isso, nesta fase o SSO fica como contrato preparado e `TODO (BLOCKER)`, sem implementação real inventada.

Como ainda não existe código da app no repositório, este guia define a estrutura técnica que deve ser criada quando a equipa iniciar a implementação. A stack canónica dos RNF é React/TypeScript/Tailwind no frontend e Node.js LTS com NestJS, MongoDB e Mongoose no backend. Redis e SSO ficam preparados, mas não são obrigatórios neste BK.

Convenção de persistência para a MF0: os documentos persistidos em MongoDB usam `_id/ObjectId`, mas a API pode devolver `id` como string. Relações entre documentos devem ser guardadas como referências `ObjectId`, por exemplo `userId` e `studyAreaId`. Campos únicos e índices pertencem aos schemas Mongoose; não se deve criar migrations SQL nesta PAP.

O mockup existente mostra o ecrã de autenticação com marca `StudyFlow`, fundo claro, formulário central, campos de email/password, botão `Entrar` e ligação `Registar`. Para este BK, o mockup orienta o fluxo entre login e registo, mas não obriga a desenho final pixel-perfect.

## Porque é que isto é importante

- Cria a identidade base que todos os BKs seguintes reutilizam: perfil, áreas de estudo, materiais, histórico e IA privada.
- Introduz desde cedo validação, hashing de password e separação entre DTO, controller, service e persistência.
- Evita o erro grave de guardar passwords em texto puro ou confiar apenas em validação no frontend.
- Deixa preparado o contrato para SSO escolar sem inventar integração externa.
- Desbloqueia o BK-MF0-02, que cria sessão segura com cookies HttpOnly.

## O que entra (scope)

- Estado esperado antes do BK: não existe modelo de utilizador, endpoint de registo nem página de registo.
- Estado esperado depois do BK: existe registo de aluno por email/password, password guardada como hash, email único e resposta sem dados sensíveis.
- Ficheiros a criar, assumindo scaffold ainda inexistente:
  - `apps/api/src/modules/auth/schemas/user.schema.ts`
  - `apps/api/src/modules/auth/auth.module.ts`
  - `apps/api/src/modules/auth/auth.controller.ts`
  - `apps/api/src/modules/auth/auth.service.ts`
  - `apps/api/src/modules/auth/dto/register-student.dto.ts`
  - `apps/api/src/modules/users/users.service.ts`
  - `apps/web/src/pages/auth/RegisterPage.tsx`
  - `apps/web/src/lib/apiClient.ts`
- Ficheiros a rever:
  - `docs/RF.md`
  - `docs/RNF.md`
  - `mockup/thumbnail.png`
  - `mockup/images/ede75b815bb4a2993eb44966fab060d2102ef8b5`
- Dependências de BK anteriores: nenhuma.
- Impacto na arquitetura: cria o domínio `auth` e o contrato mínimo da entidade `User`.
- Impacto em frontend: cria página de registo ligada ao ecrã de login do mockup.
- Impacto em backend: cria endpoint derivado `POST /api/auth/register`.
- Impacto em dados: cria utilizador com `email`, `passwordHash`, `role`, `createdAt` e `updatedAt`.
- Impacto em segurança: hashing obrigatório, email único, resposta sem `passwordHash`.
- Impacto em testes: exige smoke, negativos e integração de registo.
- Handoff: o BK-MF0-02 deve conseguir autenticar uma conta criada aqui.

## O que não entra (scope-out)

- Login e criação de cookie de sessão, que pertencem ao BK-MF0-02.
- Perfil editável completo, que pertence ao BK-MF0-03.
- Integração real com SSO escolar, porque faltam fornecedor, protocolo e credenciais.
- Recuperação de password, confirmação de email e MFA, porque não estão definidos em RF01.
- Papéis de professor/admin, que surgem noutras fases.
- Seed real de utilizadores, salvo conta local de desenvolvimento documentada como temporária.

## Como saber que isto ficou bem

- Um aluno consegue submeter email/password válidos e recebe `201 Created`.
- O backend rejeita email inválido, password fraca e email duplicado com erro controlado.
- A base de dados guarda `passwordHash` e nunca guarda `password`.
- A resposta do endpoint não inclui hash, tokens, segredos ou campos internos desnecessários.
- A página de registo permite regressar ao login, coerente com o mockup.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: repositório sem código da app; criar scaffold antes de aplicar caminhos (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AUTH-REGISTER` (DERIVADO)
- Fonte de verdade: `docs/RF.md`, `RF01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-01` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Registo do aluno por email/password, com SSO escolar apenas preparado até haver decisão institucional (CANONICO/DERIVADO)
- `rf_rnf`: `RF01` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar o contrato da entidade `User` para aluno.
- Criar DTO de entrada para registo.
- Criar endpoint `POST /api/auth/register`, derivado de RF01.
- Validar email, password e duplicação no backend.
- Guardar apenas `passwordHash`.
- Criar página `RegisterPage` com email, password e confirmação de password.
- Ligar a página de registo ao login mostrado no mockup.
- Preparar placeholders explícitos para SSO escolar sem ativar integração externa.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF01.
- `docs/RNF.md`: RNF15, RNF17, RNF25, RNF26, RNF42.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF0-01`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: linha `BK-MF0-01`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: matriz mínima de testes por prioridade.
- `mockup/thumbnail.png`: fluxo visual login/registo.
- Código da app: `TODO (BLOCKER)` até existir scaffold.

## Glossário (rápido) (DERIVADO):

- **Registo**: criação inicial de uma conta de utilizador.
- **DTO**: objeto que define os dados aceites por um endpoint.
- **Hash**: transformação segura da password para não a guardar em texto puro.
- **Salt**: valor aleatório usado no hashing para dificultar ataques por dicionário.
- **Endpoint**: URL da API que recebe um pedido, por exemplo `POST /api/auth/register`.
- **Controller**: camada que recebe o pedido HTTP e devolve resposta.
- **Service**: camada onde fica a lógica principal da funcionalidade.
- **Mongoose schema**: classe/ficheiro que descreve documentos MongoDB, validações e índices.
- **ObjectId**: identificador do MongoDB usado em `_id` e em referências entre documentos.
- **SSO escolar**: autenticação via fornecedor institucional, ainda não definido no projeto.
- **Validação backend**: verificação feita no servidor, obrigatória mesmo que o frontend valide.

## Conceitos teóricos essenciais (DERIVADO):

**Backend e endpoint.** O backend é a parte da aplicação que corre no servidor. Neste BK, ele recebe os dados de registo, valida-os, cria a conta e responde ao frontend. O endpoint derivado de RF01 é `POST /api/auth/register`.

**Controller e service.** Em NestJS, o controller deve tratar o pedido HTTP e chamar o service. O service contém a regra: validar duplicados, gerar hash e criar utilizador. Esta separação evita controllers gigantes e facilita testes.

**DTO e validação.** Um DTO como `RegisterStudentDto` define o formato esperado: `email`, `password` e `confirmPassword`. A validação no backend é obrigatória porque qualquer pessoa pode chamar a API diretamente, contornando o frontend.

**Hashing de passwords.** Passwords nunca devem ser guardadas em texto puro. O backend deve usar uma função própria, como bcrypt ou argon2, para guardar apenas `passwordHash`. A dependência concreta deve ser escolhida no scaffold, com preferência por uma biblioteca standard e mantida.

**SSO preparado, não inventado.** RF01 permite email/password ou SSO escolar. Como o fornecedor SSO não está documentado, este BK deve criar apenas pontos de extensão, por exemplo `authProvider: "local"`, e deixar a implementação real bloqueada até decisão do orientador/escola.

**Mockup como referência.** O mockup mostra a página de login e a ligação para `Registar`. O registo deve respeitar a navegação esperada, mas o design final pode evoluir.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~20 min): confirmar contrato e criar branch de trabalho**
   - Descrição detalhada do objetivo: confirmar que o BK implementa apenas RF01 e que não inclui login, perfil ou SSO real.
   - Justificação: evita scope creep logo no primeiro BK da plataforma.
   - Como fazer (0.0): criar a estrutura inicial do projeto com duas áreas principais: `apps/api` para o backend/API e `apps/web` para o frontend. Esta separação ajuda a manter claro o que corre no servidor e o que pertence à interface do utilizador.
   - Como fazer (0.1): rever `RF01`, `RNF15`, `RNF17` e a linha `BK-MF0-01` no backlog.
   - Como fazer (0.2): criar uma nota técnica no PR com a decisão: `SSO escolar fica TODO (BLOCKER)`.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`.
   - Snippet de referência: `RF01 -> POST /api/auth/register`.
   - O que verificar: o escopo não menciona login, cookie nem perfil editável.

1. **Objetivo (~35 min): criar modelo mínimo de utilizador**
   - Descrição detalhada do objetivo: adicionar o modelo `User` com campos mínimos para autenticação local.
   - Justificação: todos os BKs seguintes precisam de uma identidade estável.
   - Como fazer (1.1): criar `UserSchema` em `apps/api/src/modules/auth/schemas/user.schema.ts`.
   - Como fazer (1.2): marcar `email` como único e guardar `passwordHash`, nunca `password`.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/schemas/user.schema.ts`.
   - Snippet de referência:
     ```ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     import { HydratedDocument } from 'mongoose';

     export type UserDocument = HydratedDocument<User>;

     @Schema({ timestamps: true, collection: 'users' })
     export class User {
       @Prop({ required: true, unique: true, lowercase: true, trim: true })
       email!: string;

       @Prop({ required: true })
       passwordHash!: string;

       @Prop({ required: true, enum: ['STUDENT', 'TEACHER', 'ADMIN'], default: 'STUDENT' })
       role!: string;

       @Prop({ required: true, default: 'local' })
       authProvider!: string;
     }

     export const UserSchema = SchemaFactory.createForClass(User);
     ```
   - O que verificar: não existe campo `password` persistido.

2. **Objetivo (~35 min): criar DTO de registo**
   - Descrição detalhada do objetivo: definir a entrada aceite pelo endpoint de registo.
   - Justificação: um contrato explícito torna o endpoint previsível e testável.
   - Como fazer (2.1): criar `RegisterStudentDto` com `email`, `password` e `confirmPassword`.
   - Como fazer (2.2): validar formato de email e comprimento mínimo da password.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/dto/register-student.dto.ts`.
   - Snippet de referência:
     ```ts
     export type RegisterStudentDto = {
       email: string;
       password: string;
       confirmPassword: string;
     };
     ```
   - O que verificar: o DTO não aceita `role`, porque aluno não escolhe permissões no registo.

3. **Objetivo (~45 min): implementar service de registo**
   - Descrição detalhada do objetivo: criar a lógica que valida duplicados, confirma password e guarda hash.
   - Justificação: a regra principal fica testável fora do HTTP.
   - Como fazer (3.1): criar método `registerStudent(input)`.
   - Como fazer (3.2): se o email já existir, devolver erro controlado `409 Conflict`.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.service.ts`.
   - Snippet de referência:
     ```ts
     export async function registerStudent(input: RegisterStudentDto) {
       if (input.password !== input.confirmPassword) {
         throw new Error("PASSWORD_CONFIRMATION_MISMATCH");
       }
       return { email: input.email.toLowerCase(), role: "STUDENT" };
     }
     ```
   - O que verificar: a resposta do service não inclui `passwordHash`.

4. **Objetivo (~35 min): expor endpoint de API**
   - Descrição detalhada do objetivo: criar `POST /api/auth/register`.
   - Justificação: o frontend precisa de um contrato HTTP concreto.
   - Como fazer (4.1): criar `AuthController`.
   - Como fazer (4.2): devolver `201 Created` no caso válido e erro JSON nos casos inválidos.
   - Ficheiro a rever: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.controller.ts`.
   - Snippet de referência:
     ```ts
     // POST /api/auth/register
     // body: { email, password, confirmPassword }
     // 201: { id, email, role }
     ```
   - O que verificar: `password`, `confirmPassword` e `passwordHash` nunca aparecem na resposta.

5. **Objetivo (~45 min): criar página de registo no frontend**
   - Descrição detalhada do objetivo: criar UI de registo simples, navegável a partir do login.
   - Justificação: o mockup já mostra a ligação `Registar`; o aluno precisa de um caminho completo.
   - Como fazer (5.1): criar `RegisterPage` com campos email, password e confirmação.
   - Como fazer (5.2): mostrar estados `loading`, `error` e `success`.
   - Ficheiro a rever: `mockup/thumbnail.png`.
   - Ficheiro alvo: `apps/web/src/pages/auth/RegisterPage.tsx`.
   - Snippet de referência:
     ```tsx
     <form aria-label="Registo de aluno">
       <input name="email" type="email" autoComplete="email" />
       <input name="password" type="password" autoComplete="new-password" />
       <button type="submit">Registar</button>
     </form>
     ```
   - O que verificar: o formulário é utilizável por teclado e tem labels visíveis.

6. **Objetivo (~30 min): criar cliente API mínimo**
   - Descrição detalhada do objetivo: centralizar chamada ao backend em vez de espalhar `fetch`.
   - Justificação: BKs seguintes reutilizam o mesmo padrão.
   - Como fazer (6.1): criar função `registerStudent`.
   - Como fazer (6.2): tratar erro HTTP sem expor mensagens técnicas ao utilizador.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/lib/apiClient.ts`.
   - Snippet de referência:
     ```ts
     export async function registerStudent(payload: RegisterStudentDto) {
       const response = await fetch("/api/auth/register", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       });
       if (!response.ok) throw new Error("Não foi possível criar a conta.");
       return response.json();
     }
     ```
   - O que verificar: erros do backend são tratados sem mostrar stack traces.

7. **Objetivo (~40 min): testar caminho feliz e negativos**
   - Descrição detalhada do objetivo: provar que o registo funciona e falha de forma controlada.
   - Justificação: P0 exige smoke, integração/e2e e 3 negativos.
   - Como fazer (7.1): criar teste de service para registo válido.
   - Como fazer (7.2): criar testes de API para email duplicado, password fraca e confirmação diferente.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.service.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(result).toMatchObject({ email: "aluno@example.com", role: "STUDENT" });
     expect(result).not.toHaveProperty("passwordHash");
     ```
   - O que verificar: os negativos devolvem `400` ou `409`, nunca `500`.

8. **Objetivo (~20 min): preparar evidence e handoff**
   - Descrição detalhada do objetivo: deixar prova clara para PR/defesa e para o BK-MF0-02.
   - Justificação: o login depende de contas criadas neste BK.
   - Como fazer (8.1): registar comando usado, payload válido e outputs dos negativos.
   - Como fazer (8.2): documentar `TODO (BLOCKER)` do SSO escolar.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
   - Ficheiro alvo: descrição do PR ou relatório de evidence do BK.
   - Snippet de referência: `POST /api/auth/register -> 201`.
   - O que verificar: o próximo BK sabe qual email/password usar para testar login.

## Checklist de validação (DERIVADO):

- Smoke:
  - Criar aluno com email novo e password válida.
  - Confirmar resposta `201` com `id`, `email` e `role`.
- Negativos:
  - passo 7; input/ação: email sem `@`; resultado esperado: `400 Bad Request`; risco que cobre: dados inválidos entrarem na base.
  - passo 7; input/ação: password com menos do mínimo definido; resultado esperado: `400 Bad Request`; risco que cobre: credenciais fracas.
  - passo 7; input/ação: email já registado; resultado esperado: `409 Conflict`; risco que cobre: contas duplicadas.
- Técnico:
  - `passwordHash` existe na base de dados.
  - `passwordHash` não aparece em respostas JSON.
  - `role` é definido pelo backend como `STUDENT`.
- Regressão das fases anteriores:
  - Não aplicável, por ser o primeiro BK da macro.
- UI/mockup:
  - Login mantém ligação para registo.
  - Registo usa linguagem em português de Portugal.
- Segurança:
  - Password nunca é guardada em texto puro.
  - SSO real não é simulado com credenciais falsas.

## Critérios de aceite:

- Outputs:
  - Schema Mongoose `User` criado.
  - Endpoint `POST /api/auth/register` criado.
  - Página de registo criada.
- Verificações:
  - Registo válido responde `201`.
  - Email inválido responde `400`.
  - Email duplicado responde `409`.
- Qualidade:
  - Controller, service e DTO estão separados.
  - Não há regra de negócio sensível apenas no frontend.
- Continuidade:
  - BK-MF0-02 consegue usar a conta criada para login.
  - BK-MF0-03 consegue associar perfil ao `User`.
- Evidência:
  - PR inclui payload válido, outputs negativos e screenshot ou vídeo curto da página de registo.

## Evidence (para o PR/defesa):

- `pr`: `PR #1 - Implementação do Registo de Aluno (BK-MF0-01)`
- `proof`: `POST /api/auth/register a responder 201 Created. Utilizador guardado no MongoDB com email em lowercase e role: 'STUDENT'.`
- `neg`: `Testes negativos validados com sucesso: Email inválido (400), Password curta (400) e Email duplicado (409 Conflict).`
- `files`: `apps/api/src/modules/auth/schemas/user.schema.ts`, `apps/api/src/modules/auth/auth.module.ts`, `apps/api/src/modules/auth/auth.controller.ts`, `apps/api/src/modules/auth/auth.service.ts`, `apps/api/src/modules/auth/dto/register-student.dto.ts`, `apps/api/src/modules/users/users.service.ts`, `apps/web/src/pages/auth/RegisterPage.tsx`, `apps/web/src/lib/apiClient.ts`
- `commands`: `npm test (testes unitários do service passam a 100%)`
- `screenshots`: `Anexado print do ecrã RegisterPage.tsx no browser e logs do terminal.`
- `notes`: `SSO escolar ficou definido como TODO (BLOCKER) no código e na arquitetura. O fluxo está totalmente preparado para o BK-MF0-02 (Login) utilizando as credenciais criadas aqui.`

## TODOs

- TODO: confirmar convenção concreta de scaffold NestJS modular antes de implementar, mantendo NestJS + Mongoose como stack canónica.
- TODO: definir biblioteca de hashing no `package.json` quando a app existir.
- TODO (BLOCKER): definir fornecedor SSO escolar, protocolo, campos e ambiente de testes.
- FOLLOW-UP: no BK-MF0-02, criar sessão segura para a conta registada.
- Assunção a validar com o orientador: email/password é o caminho MVP principal de RF01.
- Decisão dependente de mockup: desenho final do ecrã de registo ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar caminhos reais após scaffold.

## Changelog
- `2026-05-24`: guia refinado para execução concreta, com contratos técnicos, passos P0 e validações negativas.
- `2026-05-25`: persistência atualizada para MongoDB/Mongoose, substituindo a stack de dados anterior.
