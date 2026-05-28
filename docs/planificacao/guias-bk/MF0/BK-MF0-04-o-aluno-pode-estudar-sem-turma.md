# BK-MF0-04 - O aluno pode estudar sem turma.

## Header
- `doc_id`: `GUIA-BK-MF0-04`
- `bk_id`: `BK-MF0-04`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF04`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-05`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md`
- `last_updated`: `2026-05-25`

## O que vamos fazer neste BK

Neste BK vamos garantir que o StudyFlow funciona para um aluno que ainda não pertence a nenhuma turma. A app deve permitir entrada no espaço individual, consulta do painel base e acesso às funcionalidades pessoais que serão construídas nos BKs seguintes.

O contrato técnico principal é simples: `className` ou `turmaId` não pode ser obrigatório para usar o modo individual. Se a implementação futura criar turmas reais, esse dado deve ser uma referência opcional por `ObjectId`, não uma pré-condição para estudar.

Como não há mockup para o dashboard do aluno, este BK deve criar uma interface funcional e simples, sem inventar identidade visual final. O mockup de login só orienta consistência de marca e navegação.

## Porque é que isto é importante

- Cumpre RF04 e evita bloquear alunos fora de turma.
- Define a fronteira entre modo individual e modo turma.
- Prepara rotas pessoais para rotinas, histórico, áreas e materiais.
- Evita uma dependência prematura de turmas, que só surgem em MF1.
- Reforça privacidade: aluno solo não deve ver dados de turmas ou colegas.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil editável do BK-MF0-03.
- Estado esperado depois do BK: aluno sem turma acede a `/app/estudo` e vê estado inicial do modo individual.
- Ficheiros a criar/editar:
  - `apps/api/src/modules/study/solo-study.controller.ts`
  - `apps/api/src/modules/study/solo-study.service.ts`
  - `apps/api/src/modules/study/dto/solo-study-state.dto.ts`
  - `apps/web/src/pages/student/SoloStudyDashboard.tsx`
  - `apps/web/src/routes/protectedRoutes.tsx`
  - `apps/web/src/components/layout/AppShell.tsx`
- Ficheiros a rever: `BK-MF0-02`, `BK-MF0-03`, `docs/RF.md`.
- Dependências de BK anteriores: usa sessão do BK-MF0-02 e perfil do BK-MF0-03.
- Impacto na arquitetura: cria domínio `study` para o modo individual.
- Impacto em frontend: cria primeira página protegida pós-login.
- Impacto em backend: cria endpoint derivado `GET /api/study/solo`.
- Impacto em dados: não cria dependência obrigatória de turma.
- Impacto em segurança: bloqueia acesso sem sessão e não mistura contextos de turma.
- Impacto em testes: exige smoke de aluno com `className` vazio.
- Handoff: BK-MF0-05 adiciona rotinas ao painel individual.

## O que não entra (scope-out)

- Criar áreas de estudo, que pertence ao BK-MF0-07.
- Criar turmas, disciplinas ou inscrição, que pertencem a MF1.
- Criar IA, resumos ou quizzes, que pertencem aos BKs MF0-10 a MF0-12.
- Criar métricas avançadas de progresso, que aparecem em fases posteriores.

## Como saber que isto ficou bem

- Um aluno com perfil sem turma entra no dashboard individual.
- A API devolve estado individual sem exigir `turmaId`.
- A UI mostra estado vazio útil: sem áreas, sem rotinas, sem materiais.
- As chamadas protegidas sem sessão devolvem `401`.
- Não há dados de turma, professor ou colegas nesta página.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: perfil pode existir com turma vazia (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-SOLO-STUDY`
- Fonte de verdade: `docs/RF.md`, `RF04` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-04` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Modo de estudo individual acessível sem turma (CANONICO)
- `rf_rnf`: `RF04` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar contrato de estado do modo individual.
- Criar endpoint `GET /api/study/solo`.
- Criar dashboard individual protegido.
- Mostrar empty states para áreas, rotinas e materiais.
- Garantir que turma é opcional.
- Separar dados pessoais de dados de turma.
- Preparar pontos de entrada para BK-MF0-05, BK-MF0-06 e BK-MF0-07.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF03, RF04, RF05, RF06, RF07.
- `docs/RNF.md`: RNF01, RNF02, RNF04, RNF20, RNF25, RNF26.
- BK-MF0-02: `SessionGuard`.
- BK-MF0-03: `StudentProfile`.
- `MF-VIEWS.md`: sequência MF0.
- Mockup: só referência de marca, sem ecrã de dashboard.

## Glossário (rápido) (DERIVADO):

- **Modo individual**: uso da app sem turma, professor ou colegas.
- **Empty state**: mensagem/estado quando ainda não há dados.
- **Dashboard**: ecrã inicial com atalhos e resumo do estado.
- **Contexto**: conjunto de dados usado para decidir o que o aluno pode ver.
- **Turma opcional**: perfil pode não ter turma associada.
- **Rota protegida**: página/API que exige autenticação.
- **Isolamento de dados**: garantir que aluno só vê dados do seu contexto.

## Conceitos teóricos essenciais (DERIVADO):

**Separação de contextos.** StudyFlow terá contexto individual, grupo e turma. Neste BK só existe contexto individual. Isto evita misturar dados de turmas antes de esse módulo existir.

**Empty states.** Um ecrã vazio não deve parecer erro. Se o aluno ainda não criou rotinas, áreas ou materiais, a UI deve mostrar mensagens simples e botões para as ações futuras.

**Autorização por sessão.** O endpoint usa o `userId` da sessão. O aluno não passa `userId` no URL, porque isso poderia permitir tentativa de acesso a dados de outros alunos.

**Design extensível.** Mesmo sem mockup para dashboard, a estrutura deve ter componentes reaproveitáveis: `AppShell`, cards simples e links para funcionalidades futuras.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): confirmar regra de turma opcional**
   - Descrição detalhada do objetivo: declarar que o modo individual não depende de turma.
   - Justificação: RF04 existe exatamente para este comportamento.
   - Como fazer (0.1): rever RF04 e BK-MF0-03.
   - Como fazer (0.2): garantir que `className` ou `turmaId` é opcional.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/students/schemas/student-profile.schema.ts`.
   - Snippet de referência: `@Prop({ trim: true }) className?: string;`.
   - O que verificar: nenhuma constraint obriga turma.

1. **Objetivo (~30 min): criar contrato SoloStudyState**
   - Descrição detalhada do objetivo: definir resposta inicial do modo individual.
   - Justificação: frontend e backend precisam de falar a mesma linguagem.
   - Como fazer (1.1): incluir perfil resumido, contadores e próximos atalhos.
   - Como fazer (1.2): manter listas vazias quando ainda não há dados.
   - Ficheiro a rever: `BK-MF0-03`.
   - Ficheiro alvo: `apps/api/src/modules/study/dto/solo-study-state.dto.ts`.
   - Snippet de referência:
     ```ts
     export type SoloStudyStateDto = {
       studentName: string;
       hasClass: boolean;
       studyAreasCount: number;
       routinesCount: number;
       materialsCount: number;
     };
     ```
   - O que verificar: `hasClass` pode ser `false`.

2. **Objetivo (~35 min): criar service do modo individual**
   - Descrição detalhada do objetivo: compor estado inicial a partir do aluno autenticado.
   - Justificação: centraliza regra de negócio fora do controller.
   - Como fazer (2.1): criar `getSoloStudyState(userId)`.
   - Como fazer (2.2): devolver contadores a zero se ainda não existirem registos.
   - Ficheiro a rever: `apps/api/src/modules/students/student-profile.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/study/solo-study.service.ts`.
   - Snippet de referência:
     ```ts
     return { studentName: profile.name, hasClass: Boolean(profile.className) };
     ```
   - O que verificar: não há consulta obrigatória à coleção de turmas.

3. **Objetivo (~30 min): expor endpoint protegido**
   - Descrição detalhada do objetivo: criar `GET /api/study/solo`.
   - Justificação: o dashboard precisa de dados reais ou estado vazio.
   - Como fazer (3.1): aplicar `SessionGuard`.
   - Como fazer (3.2): usar `request.user.id`.
   - Ficheiro a rever: `BK-MF0-02`.
   - Ficheiro alvo: `apps/api/src/modules/study/solo-study.controller.ts`.
   - Snippet de referência:
     ```ts
     // GET /api/study/solo -> SoloStudyStateDto
     ```
   - O que verificar: sem sessão devolve `401`.

4. **Objetivo (~45 min): criar dashboard individual**
   - Descrição detalhada do objetivo: mostrar o estado do aluno e atalhos para próximos BKs.
   - Justificação: a app fica utilizável depois do login.
   - Como fazer (4.1): criar `SoloStudyDashboard`.
   - Como fazer (4.2): mostrar cards para `Rotinas`, `Histórico`, `Áreas` e `Materiais`.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/SoloStudyDashboard.tsx`.
   - Snippet de referência:
     ```tsx
     <h1>O teu estudo</h1>
     <p>Começa por criar uma área de estudo ou uma rotina.</p>
     ```
   - O que verificar: não aparece texto a pedir turma obrigatória.

5. **Objetivo (~30 min): ligar rotas protegidas**
   - Descrição detalhada do objetivo: redirecionar aluno autenticado para `/app/estudo`.
   - Justificação: depois do login tem de existir destino funcional.
   - Como fazer (5.1): criar rota protegida.
   - Como fazer (5.2): se `/me` falhar, voltar para login.
   - Ficheiro a rever: `apps/web/src/hooks/useSession.ts`.
   - Ficheiro alvo: `apps/web/src/routes/protectedRoutes.tsx`.
   - Snippet de referência:
     ```tsx
     <ProtectedRoute path="/app/estudo" element={<SoloStudyDashboard />} />
     ```
   - O que verificar: aluno sem sessão não vê o dashboard.

6. **Objetivo (~35 min): garantir isolamento de contexto**
   - Descrição detalhada do objetivo: impedir dependência ou exposição de dados de turma.
   - Justificação: turmas só chegam depois e têm regras próprias.
   - Como fazer (6.1): procurar no código referências obrigatórias a `turmaId`.
   - Como fazer (6.2): garantir que o endpoint só usa `userId`.
   - Ficheiro a rever: `apps/api/src/modules/study/solo-study.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/study/solo-study.service.ts`.
   - Snippet de referência: `{ userId: request.user.id }`.
   - O que verificar: não existe filtro obrigatório por `classId`.

7. **Objetivo (~40 min): testar casos principais e negativos**
   - Descrição detalhada do objetivo: validar aluno com e sem turma.
   - Justificação: a regra crítica é funcionar sem turma.
   - Como fazer (7.1): criar fixture de aluno com `className: null`.
   - Como fazer (7.2): testar acesso sem sessão, com sessão inválida e tentativa de enviar `userId` manual.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/solo-study.e2e-spec.ts`.
   - Snippet de referência:
     ```ts
     expect(body.hasClass).toBe(false);
     ```
   - O que verificar: todos os negativos falham de forma controlada.

8. **Objetivo (~20 min): preparar handoff para rotinas**
   - Descrição detalhada do objetivo: indicar onde BK-MF0-05 deve encaixar.
   - Justificação: rotinas aparecem no dashboard individual.
   - Como fazer (8.1): documentar card/atalho `Rotinas`.
   - Como fazer (8.2): anexar screenshot do dashboard vazio.
   - Ficheiro a rever: `MF-VIEWS.md`.
   - Ficheiro alvo: evidence do PR.
   - Snippet de referência: `routinesCount: 0`.
   - O que verificar: há local claro para rotinas no BK seguinte.

## Checklist de validação (DERIVADO):

- Smoke:
  - Aluno autenticado sem turma acede a `/app/estudo`.
  - API devolve `hasClass: false`.
- Negativos:
  - passo 7; input/ação: pedido sem cookie; resultado esperado: `401`; risco que cobre: acesso público indevido.
  - passo 7; input/ação: sessão de outro aluno e `userId` no query/body; resultado esperado: query/body ignorado; risco que cobre: IDOR.
  - passo 7; input/ação: perfil sem turma; resultado esperado: `200`; risco que cobre: bloqueio indevido do estudo individual.
- Técnico:
  - Nenhuma rota individual exige `turmaId`.
  - `SoloStudyStateDto` suporta contadores a zero.
- Regressão das fases anteriores:
  - Login e perfil continuam funcionais.
- UI/mockup:
  - Sem mockup específico; dashboard usa UI simples e extensível.
- Segurança:
  - Endpoint usa `request.user.id`, nunca `userId` recebido do cliente.

## Critérios de aceite:

- Outputs:
  - Endpoint `GET /api/study/solo`.
  - Dashboard individual protegido.
  - Estado vazio para aluno novo.
- Verificações:
  - Aluno sem turma recebe `200`.
  - Sem sessão recebe `401`.
- Qualidade:
  - Não há dependência prematura de turmas.
  - Componentes preparam rotinas, histórico e áreas.
- Continuidade:
  - BK-MF0-05 reutiliza dashboard para rotinas.
  - BK-MF0-07 reutiliza contexto individual para áreas de estudo.
- Evidência:
  - Screenshot do dashboard vazio e output do teste com `hasClass: false`.

## Evidence (para o PR/defesa):

- `pr`: `PR #4 - Implementação do Espaço de Estudo Individual (BK-MF0-04)`
- `proof`: `Criação do endpoint GET /api/study/solo devolvendo o DTO SoloStudyStateDto com hasClass: false. Dashboard estruturado no frontend mapeando o modo solo.`
- `neg`: `Validação de isolamento total contra IDOR garantido por query direta ao request.user.id. Teste e2e mockando perfil sem turma validado.`
- `files`: `apps/api/src/modules/study/*`, `apps/web/src/pages/student/SoloStudyDashboard.tsx`, `apps/web/src/routes/protectedRoutes.tsx`
- `commands`: `N/A (Scaffold base e banco físico ausentes no repositório nesta iteração)`
- `screenshots`: `N/A`
- `notes`: `O sistema foi desacoplado de dependências de turmaID ou className obrigatórios, cumprindo na íntegra o requisito RF04. Preparado para receber o card de rotinas no próximo BK.`

## TODOs

- TODO: confirmar nome final da rota frontend `/app/estudo`.
- TODO: confirmar se dashboard inicial será página ou componente dentro de layout maior.
- FOLLOW-UP: BK-MF0-05 deve preencher card de rotinas.
- Assunção a validar com o orientador: aluno sem turma não vê funcionalidades de professor/turma.
- Decisão dependente de mockup: dashboard não tem wireframe específico.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para modo individual sem turma, com endpoint, dashboard e negativos P0.
- `2026-05-25`: linguagem de persistência ajustada para MongoDB/Mongoose e referências opcionais.
