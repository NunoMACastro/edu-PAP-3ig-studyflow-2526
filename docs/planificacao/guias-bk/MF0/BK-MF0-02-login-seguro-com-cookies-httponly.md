# BK-MF0-02 - Login seguro com cookies HttpOnly.

## Header
- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF02`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-login-seguro-com-cookies-httponly.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos construir o login seguro do StudyFlow. O aluno introduz email/password, o backend valida as credenciais e cria uma sessão web usando cookie HttpOnly. Este BK é separado do registo para que a equipa perceba bem a diferença entre criar uma conta e autenticar uma sessão.

O requisito RF02 é explícito: o login deve usar cookies HttpOnly. Isso significa que a sessão não deve ser guardada em `localStorage`, porque JavaScript no browser consegue ler `localStorage`, aumentando o impacto de XSS. O cookie HttpOnly é enviado pelo browser em pedidos HTTP, mas não fica acessível ao JavaScript da página.

O mockup existente cobre diretamente este BK: ecrã central com marca `StudyFlow`, campos `Email` e `Password`, botão `Entrar` e ligação para `Registar`. O guia usa essa referência para fluxo e nomenclatura, sem exigir pixel-perfect.

## Porque é que isto é importante

- Desbloqueia todas as rotas protegidas da app: perfil, áreas, materiais, histórico e IA.
- Introduz sessão segura reutilizável por BKs futuros.
- Reduz exposição de tokens no frontend ao usar cookies HttpOnly.
- Obriga a pensar em erros negativos: credenciais erradas, utilizador inexistente e cookie inválido.
- Prepara `GET /api/auth/me`, que o frontend usa para saber quem está autenticado.

## O que entra (scope)

- Estado esperado antes do BK: existe, ou fica previsto pelo BK-MF0-01, um `User` com `email` e `passwordHash`.
- Estado esperado depois do BK: aluno consegue entrar, receber cookie HttpOnly e consultar a própria sessão.
- Ficheiros a criar, assumindo scaffold ainda inexistente:
  - `apps/api/src/modules/auth/dto/login.dto.ts`
  - `apps/api/src/modules/auth/auth.controller.ts`
  - `apps/api/src/modules/auth/auth.service.ts`
  - `apps/api/src/modules/auth/session.service.ts`
  - `apps/api/src/common/guards/session.guard.ts`
  - `apps/api/src/common/middleware/csrf.middleware.ts`
  - `apps/web/src/pages/auth/LoginPage.tsx`
  - `apps/web/src/hooks/useSession.ts`
- Ficheiros a rever:
  - `docs/RF.md`
  - `docs/RNF.md`
  - `mockup/thumbnail.png`
- Dependências de BK anteriores: nenhuma canónica, mas deve reutilizar o contrato de `User` definido no BK-MF0-01 se esse BK já tiver sido implementado.
- Impacto na arquitetura: cria o contrato de sessão e o primeiro guard reutilizável.
- Impacto em frontend: login passa a atualizar estado de utilizador autenticado.
- Impacto em backend: cria endpoints derivados `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me`.
- Impacto em dados: sessão deve ter identificador opaco, expiração e ligação ao `userId`.
- Impacto em segurança: cookie `HttpOnly`, `Secure` em produção e `SameSite`.
- Impacto em testes: exige testes de credenciais válidas, inválidas e sessão expirada.
- Handoff: BK-MF0-03 deve proteger edição de perfil com `SessionGuard`.

## O que não entra (scope-out)

- Registo de aluno, coberto pelo BK-MF0-01.
- Recuperação de password, MFA ou confirmação de email, não definidos nos RF/RNF.
- Login social ou SSO escolar real, ainda bloqueado por falta de contrato.
- Gestão avançada de roles, pertencente a fases posteriores.
- CSRF completo para todos os formulários da app, que será reforçado em BKs de segurança, embora o padrão de proteção fique preparado.

## Como saber que isto ficou bem

- Login válido responde `200 OK` e define cookie HttpOnly.
- `GET /api/auth/me` devolve o aluno autenticado sem expor dados sensíveis.
- Login inválido devolve erro controlado e genérico.
- Logout remove/invalida a sessão.
- O frontend deixa de depender de tokens em `localStorage`.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: ter contrato `User` disponível ou criado no mesmo arranque técnico da MF0 (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AUTH-LOGIN`
- Fonte de verdade: `docs/RF.md`, `RF02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Login seguro com cookie HttpOnly para sessão web (CANONICO)
- `rf_rnf`: `RF02` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar DTO de login.
- Validar credenciais no backend.
- Comparar password recebida com `passwordHash`.
- Criar sessão com expiração.
- Enviar cookie HttpOnly com flags seguras.
- Criar endpoint `GET /api/auth/me`.
- Criar `SessionGuard` reutilizável.
- Criar página de login alinhada ao mockup.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF02.
- `docs/RNF.md`: RNF16, RNF17, RNF25, RNF42.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`: linha `BK-MF0-02`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`: linha `BK-MF0-02`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`: exigências de testes P0.
- `mockup/thumbnail.png`: ecrã de login.
- BK-MF0-01: contrato `User`, se já estiver implementado.

## Glossário (rápido) (DERIVADO):

- **Login**: validação de credenciais para iniciar sessão.
- **Sessão**: estado que prova que o utilizador está autenticado.
- **Cookie HttpOnly**: cookie inacessível ao JavaScript do browser.
- **SameSite**: política que reduz envio de cookies em pedidos cross-site.
- **Secure**: flag que exige HTTPS para enviar o cookie.
- **Guard**: camada que bloqueia rotas sem sessão válida.
- **CSRF**: ataque que tenta usar cookies do utilizador sem consentimento.
- **Credenciais**: email e password submetidos no login.
- **Erro genérico**: mensagem que não revela se o email existe ou se a password falhou.

## Conceitos teóricos essenciais (DERIVADO):

**Cookies HttpOnly.** Um cookie HttpOnly é definido pelo servidor e enviado automaticamente pelo browser em pedidos para o mesmo domínio. Como JavaScript não o consegue ler, reduz o risco de roubo de sessão em caso de XSS.

**Sessão opaca.** A sessão deve ser representada por um identificador aleatório, não por dados pessoais. O backend consulta a sessão e decide quem é o utilizador. Assim, o frontend não precisa de guardar tokens sensíveis.

**Fluxo request -> controller -> service -> response.** O pedido chega ao controller, o controller chama o service, o service valida credenciais e o controller define o cookie na resposta. Esta separação deixa o código mais testável.

**Guard de autenticação.** O `SessionGuard` será usado por BKs seguintes. Se não houver cookie válido, devolve `401 Unauthorized`. Se houver sessão válida, anexa o utilizador ao request.

**CSRF e SameSite.** Cookies são enviados automaticamente, por isso há risco de CSRF. `SameSite=Lax` ou `Strict` reduz esse risco. Para ações sensíveis futuras, deve existir token CSRF, mas este BK prepara o padrão inicial.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~20 min): confirmar contratos de autenticação**
   - Descrição detalhada do objetivo: mapear RF02 para endpoints e flags de cookie.
   - Justificação: evita implementar login inseguro com `localStorage`.
   - Como fazer (0.1): confirmar `RF02` e `RNF16`.
   - Como fazer (0.2): escrever no PR que cookies HttpOnly são obrigatórios.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: descrição técnica do BK.
   - Snippet de referência: `Set-Cookie: sid=...; HttpOnly; SameSite=Lax`.
   - O que verificar: a palavra `localStorage` não aparece como estratégia de sessão.

1. **Objetivo (~25 min): criar DTO de login**
   - Descrição detalhada do objetivo: definir entrada de `email` e `password`.
   - Justificação: a API deve rejeitar payloads inesperados.
   - Como fazer (1.1): criar `LoginDto`.
   - Como fazer (1.2): validar email e password obrigatórios.
   - Ficheiro a rever: `apps/api/src/modules/auth/dto/register-student.dto.ts`.
   - Ficheiro alvo: `apps/api/src/modules/auth/dto/login.dto.ts`.
   - Snippet de referência:
     ```ts
     export type LoginDto = {
       email: string;
       password: string;
     };
     ```
   - O que verificar: o DTO não aceita `role`, `userId` ou campos de sessão.

2. **Objetivo (~45 min): validar credenciais no service**
   - Descrição detalhada do objetivo: procurar utilizador por email e comparar password com hash.
   - Justificação: nunca se compara password em texto puro guardada na base.
   - Como fazer (2.1): normalizar email para minúsculas.
   - Como fazer (2.2): devolver erro genérico para email inexistente ou password errada.
   - Ficheiro a rever: `apps/api/src/modules/auth/auth.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.service.ts`.
   - Snippet de referência:
     ```ts
     throw new Error("INVALID_CREDENTIALS");
     ```
   - O que verificar: a mensagem não revela se o email existe.

3. **Objetivo (~45 min): criar sessão e cookie**
   - Descrição detalhada do objetivo: gerar sessão e enviar cookie HttpOnly.
   - Justificação: cumpre RF02 e reduz exposição da sessão no browser.
   - Como fazer (3.1): criar `SessionService`.
   - Como fazer (3.2): configurar `httpOnly`, `sameSite`, `secure` em produção e `maxAge`.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/session.service.ts`.
   - Snippet de referência:
     ```ts
     response.cookie("sid", sessionId, {
       httpOnly: true,
       sameSite: "lax",
       secure: process.env.NODE_ENV === "production",
     });
     ```
   - O que verificar: o cookie não é acessível via `document.cookie`.

4. **Objetivo (~35 min): criar endpoints login/logout/me**
   - Descrição detalhada do objetivo: expor a sessão ao frontend por API.
   - Justificação: o frontend precisa de saber quando o utilizador está autenticado.
   - Como fazer (4.1): criar `POST /api/auth/login`.
   - Como fazer (4.2): criar `POST /api/auth/logout` e `GET /api/auth/me`.
   - Ficheiro a rever: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.controller.ts`.
   - Snippet de referência:
     ```ts
     // GET /api/auth/me
     // 200: { id, email, role }
     // 401: { code: "UNAUTHENTICATED" }
     ```
   - O que verificar: logout invalida a sessão.

5. **Objetivo (~40 min): criar SessionGuard**
   - Descrição detalhada do objetivo: proteger rotas futuras com sessão válida.
   - Justificação: BK-MF0-03 e seguintes vão precisar desta base.
   - Como fazer (5.1): ler cookie `sid`.
   - Como fazer (5.2): anexar `request.user` se a sessão estiver válida.
   - Ficheiro a rever: `apps/api/src/modules/auth/session.service.ts`.
   - Ficheiro alvo: `apps/api/src/common/guards/session.guard.ts`.
   - Snippet de referência:
     ```ts
     if (!session) throw new UnauthorizedException("UNAUTHENTICATED");
     ```
   - O que verificar: sem cookie a rota protegida devolve `401`.

6. **Objetivo (~45 min): ligar frontend ao login do mockup**
   - Descrição detalhada do objetivo: implementar página `LoginPage` com feedback claro.
   - Justificação: o mockup define o primeiro contacto do utilizador com a app.
   - Como fazer (6.1): criar formulário com email/password.
   - Como fazer (6.2): chamar `POST /api/auth/login` com `credentials: "include"`.
   - Ficheiro a rever: `mockup/thumbnail.png`.
   - Ficheiro alvo: `apps/web/src/pages/auth/LoginPage.tsx`.
   - Snippet de referência:
     ```ts
     await fetch("/api/auth/login", {
       method: "POST",
       credentials: "include",
       body: JSON.stringify(payload),
     });
     ```
   - O que verificar: o login não tenta guardar token no browser.

7. **Objetivo (~45 min): testar login e proteção**
   - Descrição detalhada do objetivo: comprovar caminho feliz e falhas controladas.
   - Justificação: autenticação é crítica e P0 exige negativos.
   - Como fazer (7.1): testar login válido com conta criada.
   - Como fazer (7.2): testar password errada, email inexistente e cookie inválido.
   - Ficheiro a rever: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/auth/auth.e2e-spec.ts`.
   - Snippet de referência:
     ```ts
     expect(response.headers["set-cookie"]).toContain("HttpOnly");
     ```
   - O que verificar: negativos devolvem `401` ou `400`, não `500`.

8. **Objetivo (~20 min): preparar handoff para perfil**
   - Descrição detalhada do objetivo: documentar como uma rota protegida deve usar sessão.
   - Justificação: BK-MF0-03 depende do utilizador autenticado.
   - Como fazer (8.1): guardar exemplo de cookie e resposta de `/me` na evidence.
   - Como fazer (8.2): indicar que o próximo BK deve usar `SessionGuard`.
   - Ficheiro a rever: `docs/planificacao/backlogs/MF-VIEWS.md`.
   - Ficheiro alvo: descrição do PR ou relatório de evidence.
   - Snippet de referência: `GET /api/auth/me -> 200`.
   - O que verificar: existe exemplo claro para reutilização.

## Checklist de validação (DERIVADO):

- Smoke:
  - Login com email/password válidos.
  - `GET /api/auth/me` responde com utilizador autenticado.
- Negativos:
  - passo 7; input/ação: password errada; resultado esperado: `401 Unauthorized`; risco que cobre: autenticação indevida.
  - passo 7; input/ação: email inexistente; resultado esperado: erro genérico `401`; risco que cobre: enumeração de contas.
  - passo 7; input/ação: cookie `sid` inválido; resultado esperado: `401`; risco que cobre: sessão forjada.
- Técnico:
  - Cookie tem `HttpOnly`.
  - Cookie tem `SameSite`.
  - `Secure` fica ativo em produção.
- Regressão das fases anteriores:
  - Conta criada no BK-MF0-01 continua válida para login.
- UI/mockup:
  - Ecrã mantém marca `StudyFlow`, campos `Email` e `Password`, botão `Entrar` e link `Registar`.
- Segurança:
  - Sem tokens em `localStorage`.
  - Sem mensagens que revelem se o email existe.

## Critérios de aceite:

- Outputs:
  - Endpoints `login`, `logout` e `me` criados.
  - Cookie HttpOnly criado no login.
  - `SessionGuard` criado.
- Verificações:
  - Login válido responde `200`.
  - Credenciais inválidas respondem `401`.
  - Logout invalida sessão.
- Qualidade:
  - Controller, service e session service separados.
  - Erros são explícitos e genéricos para autenticação.
- Continuidade:
  - BK-MF0-03 consegue obter `request.user`.
  - BKs futuros podem proteger rotas com o mesmo guard.
- Evidência:
  - PR inclui cabeçalho `Set-Cookie` e testes negativos.

## Evidence (para o PR/defesa):

- `pr`: `PR #2 - Modelação de Autenticação Segura com Cookies HttpOnly (BK-MF0-02)`
ar="proof": `Fluxo concebido para POST /api/auth/login injetar cookie 'sid' com flags httpOnly e sameSite=lax. Rota GET /api/auth/me estruturada para devolver a sessão ativa.`
- `neg`: `Erros genéricos controlados mapeados para a especificação: password errada (401), utilizador inexistente (401 sem revelação de email) e cookie inválido (401).`
- `files`: `apps/api/src/modules/auth/*`, `apps/api/src/common/guards/session.guard.ts`, `apps/web/src/pages/auth/LoginPage.tsx`
- `commands`: `N/A (Scaffold e dependências do Redis/NestJS ainda não injetados no repositório)`
- `screenshots`: `N/A`
- `notes`: `Especificação concluída com sucesso. Garantiu-se que o frontend nunca guardará tokens em localStorage, mitigando falhas de XSS. O SessionGuard está desenhado e pronto para proteger o perfil do aluno no BK-MF0-03.`

## TODOs

- TODO: confirmar provisionamento de Redis para sessões na infraestrutura; em desenvolvimento, qualquer fallback deve ficar explícito e não substituir Redis como decisão canónica.
- TODO: definir duração oficial da sessão com orientador.
- TODO (BLOCKER): SSO escolar continua bloqueado até existir fornecedor/protocolo.
- FOLLOW-UP: BK-MF0-03 deve usar `SessionGuard`.
- Assunção a validar com o orientador: `SameSite=Lax` é suficiente no MVP, reforçando CSRF nos BKs de segurança.
- Decisão dependente de mockup: confirmar se o ecrã de login final mantém layout central.
- Decisão dependente de app/código ainda inexistente: confirmar paths reais após scaffold.

## Changelog
- `2026-05-24`: guia refinado para execução concreta, com sessão HttpOnly, guard reutilizável e validações negativas.
- `2026-05-25`: alinhado TODO de sessões com Redis como decisão canónica da stack.
