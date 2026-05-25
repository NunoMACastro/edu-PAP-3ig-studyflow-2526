# BK-MF0-05 - O aluno pode criar rotinas e objetivos de estudo.

## Header
- `doc_id`: `GUIA-BK-MF0-05`
- `bk_id`: `BK-MF0-05`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-06`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno crie rotinas e objetivos de estudo pessoais. Uma rotina representa uma repetição planeada, por exemplo estudar 30 minutos à segunda e quarta. Um objetivo representa uma meta, por exemplo concluir revisão de funções até uma data.

Este BK continua o modo individual definido no BK-MF0-04. As rotinas e objetivos pertencem ao aluno autenticado, não à turma. Mais tarde, notificações e alertas poderão usar estes dados, mas este BK só cria o contrato base.

Não existe mockup específico para esta funcionalidade. A UI deve ser simples, com formulário, lista e estados vazios, sem inventar gamificação, rankings ou regras de produtividade não documentadas.

## Porque é que isto é importante

- Dá utilidade prática imediata ao modo individual.
- Prepara o histórico do BK-MF0-06 e notificações futuras.
- Ensina modelação de dados simples com dono (`userId`).
- Reforça validação de datas e duração.
- Evita misturar rotinas pessoais com tarefas de turma.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil e acesso ao modo individual.
- Estado esperado depois do BK: aluno cria, lista, edita estado e remove rotinas/objetivos pessoais.
- Ficheiros a criar/editar:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/modules/study/routines.controller.ts`
  - `apps/api/src/modules/study/routines.service.ts`
  - `apps/api/src/modules/study/dto/create-routine.dto.ts`
  - `apps/api/src/modules/study/dto/create-goal.dto.ts`
  - `apps/web/src/pages/student/RoutinesPage.tsx`
  - `apps/web/src/components/study/RoutineForm.tsx`
  - `apps/web/src/components/study/GoalForm.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, `docs/RF.md`.
- Dependências de BK anteriores: perfil do BK-MF0-03 e dashboard individual do BK-MF0-04 quando disponível.
- Impacto na arquitetura: expande domínio `study`.
- Impacto em frontend: cria CRUD simples com estados loading/error/empty/success.
- Impacto em backend: endpoints derivados `GET/POST/PATCH/DELETE /api/study/routines` e `GET/POST/PATCH/DELETE /api/study/goals`.
- Impacto em dados: cria `StudyRoutine` e `StudyGoal`.
- Impacto em segurança: cada registo pertence ao aluno autenticado.
- Impacto em testes: valida datas, duração e ownership.
- Handoff: BK-MF0-06 usa rotinas/objetivos como eventos no histórico.

## O que não entra (scope-out)

- Notificações automáticas, que pertencem a BKs futuros.
- Calendário avançado, ICS ou integração externa.
- Métricas de progresso de turma.
- Recomendações de IA para criar rotinas.
- Regras de gamificação, streaks ou pontuação não documentadas.

## Como saber que isto ficou bem

- Aluno cria rotina com título, frequência simples e duração.
- Aluno cria objetivo com título e data alvo opcional.
- Aluno só vê as suas rotinas e objetivos.
- Dados inválidos são rejeitados com erro claro.
- Dashboard individual consegue mostrar contadores de rotinas/objetivos.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Natalia` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: aluno autenticado e perfil criado (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-ROUTINES-GOALS`
- Fonte de verdade: `docs/RF.md`, `RF05` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-05` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Rotinas e objetivos pessoais de estudo (CANONICO)
- `rf_rnf`: `RF05` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelos `StudyRoutine` e `StudyGoal`.
- Criar DTOs de criação/edição.
- Criar endpoints protegidos.
- Criar página de rotinas e objetivos.
- Validar datas, duração e ownership.
- Atualizar contadores do dashboard individual.
- Preparar eventos para histórico.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF05 e RF48.
- `docs/RNF.md`: RNF03, RNF06, RNF42, RNF43.
- BK-MF0-03: perfil do aluno.
- BK-MF0-04: dashboard individual.
- `PLANO-SPRINTS.md`: testes P1 e negativos mínimos.

## Glossário (rápido) (DERIVADO):

- **Rotina**: plano repetível de estudo.
- **Objetivo**: meta de estudo a alcançar.
- **CRUD**: criar, ler, atualizar e apagar.
- **Ownership**: registo pertence a um utilizador.
- **Validação de data**: garantir formato e coerência temporal.
- **Estado vazio**: ecrã quando ainda não há rotinas.
- **Soft delete**: marcar como inativo em vez de apagar fisicamente, se a equipa decidir manter histórico.

## Conceitos teóricos essenciais (DERIVADO):

**CRUD com ownership.** Rotinas e objetivos são dados pessoais. Todas as queries devem usar `userId` da sessão para impedir que um aluno aceda a registos de outro.

**Datas e localização.** O RNF43 exige datas no formato `dd/mm/aaaa` na interface. Internamente, a API pode guardar ISO date, mas a UI deve apresentar datas em PT-PT.

**Validação backend.** A UI pode impedir duração negativa, mas o backend também tem de validar. Isto evita que pedidos diretos à API criem dados impossíveis.

**Soft delete vs hard delete.** Para histórico futuro, pode fazer sentido marcar uma rotina como `archived` em vez de apagar. Como RF05 não exige histórico completo aqui, isto fica como assunção técnica.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): confirmar escopo pessoal**
   - Descrição detalhada do objetivo: garantir que rotinas pertencem ao aluno, não à turma.
   - Justificação: turmas não existem nesta fase.
   - Como fazer (0.1): rever RF05.
   - Como fazer (0.2): confirmar que endpoints usam `SessionGuard`.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/routines.controller.ts`.
   - Snippet de referência: `where: { userId: request.user.id }`.
   - O que verificar: não há `classId` obrigatório.

1. **Objetivo (~30 min): criar modelos de dados**
   - Descrição detalhada do objetivo: persistir rotinas e objetivos.
   - Justificação: dados precisam sobreviver ao refresh da página.
   - Como fazer (1.1): criar `StudyRoutine`.
   - Como fazer (1.2): criar `StudyGoal`.
   - Ficheiro a rever: `apps/api/prisma/schema.prisma`.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência:
     ```prisma
     model StudyRoutine {
       id              String @id @default(uuid())
       userId          String
       title           String
       frequency       String
       targetMinutes   Int
       active          Boolean @default(true)
     }
     ```
   - O que verificar: ambos têm `userId`.

2. **Objetivo (~25 min): criar DTOs e validações**
   - Descrição detalhada do objetivo: aceitar apenas campos necessários.
   - Justificação: validação clara evita dados incoerentes.
   - Como fazer (2.1): validar `title` obrigatório.
   - Como fazer (2.2): validar `targetMinutes > 0`.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/dto/create-routine.dto.ts`.
   - Snippet de referência:
     ```ts
     export type CreateRoutineDto = {
       title: string;
       frequency: "daily" | "weekly";
       targetMinutes: number;
     };
     ```
   - O que verificar: duração zero ou negativa é inválida.

3. **Objetivo (~35 min): implementar service**
   - Descrição detalhada do objetivo: criar funções de listagem, criação e atualização.
   - Justificação: regras ficam fora do controller.
   - Como fazer (3.1): criar `listMyRoutines(userId)`.
   - Como fazer (3.2): criar `createRoutine(userId, input)`.
   - Ficheiro a rever: BK-MF0-04.
   - Ficheiro alvo: `apps/api/src/modules/study/routines.service.ts`.
   - Snippet de referência:
     ```ts
     export async function createRoutine(userId: string, input: CreateRoutineDto) {
       return routineRepository.create({ ...input, userId });
     }
     ```
   - O que verificar: `userId` vem da sessão.

4. **Objetivo (~30 min): criar endpoints**
   - Descrição detalhada do objetivo: expor API para frontend.
   - Justificação: UI precisa de listar e guardar rotinas/objetivos.
   - Como fazer (4.1): criar `GET` e `POST`.
   - Como fazer (4.2): criar `PATCH` para ativar/concluir/arquivar.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/routines.controller.ts`.
   - Snippet de referência:
     ```ts
     // POST /api/study/routines
     // 201: StudyRoutine
     ```
   - O que verificar: sem sessão devolve `401`.

5. **Objetivo (~40 min): criar UI de rotinas e objetivos**
   - Descrição detalhada do objetivo: criar formulário e lista.
   - Justificação: funcionalidade deve ser executável pelo aluno.
   - Como fazer (5.1): criar `RoutinesPage`.
   - Como fazer (5.2): mostrar empty state e feedback de guardar.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/RoutinesPage.tsx`.
   - Snippet de referência:
     ```tsx
     <button type="submit">Guardar rotina</button>
     ```
   - O que verificar: datas aparecem em `dd/mm/aaaa` quando existirem.

6. **Objetivo (~35 min): testar e preparar handoff**
   - Descrição detalhada do objetivo: provar CRUD mínimo e negativos.
   - Justificação: BK-MF0-06 depende destes registos para histórico.
   - Como fazer (6.1): testar criação válida.
   - Como fazer (6.2): testar duração inválida e acesso a rotina de outro aluno.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/routines.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(created.userId).toBe(currentUser.id);
     ```
   - O que verificar: evidence inclui IDs e resultados negativos.

## Checklist de validação (DERIVADO):

- Smoke:
  - Criar rotina válida.
  - Criar objetivo válido.
- Negativos:
  - passo 6; input/ação: `targetMinutes: 0`; resultado esperado: `400`; risco que cobre: dados impossíveis.
  - passo 6; input/ação: editar rotina de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
- Técnico:
  - Todas as queries filtram por `userId`.
  - Datas na UI seguem `dd/mm/aaaa`.
- Regressão das fases anteriores:
  - Dashboard individual continua acessível sem turma.
- UI/mockup:
  - Sem mockup específico; UI simples, clara e em PT-PT.
- Segurança:
  - Não aceitar `userId` vindo do body.

## Critérios de aceite:

- Outputs:
  - Modelos de rotina e objetivo.
  - API protegida.
  - Página de rotinas.
- Verificações:
  - Criação válida responde `201`.
  - Duração inválida responde `400`.
- Qualidade:
  - DTOs limitam campos aceites.
  - UI mostra loading/error/success.
- Continuidade:
  - BK-MF0-06 consegue listar eventos derivados de rotinas/objetivos.
- Evidência:
  - PR inclui smoke e 2 negativos.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/study/*`, `apps/web/src/pages/student/RoutinesPage.tsx`
- `commands`: `npm test`, `npm run lint`
- `screenshots`: `A preencher com lista de rotinas`
- `notes`: `Notificações ficam fora deste BK`

## TODOs

- TODO: confirmar lista final de frequências permitidas.
- TODO: decidir soft delete vs hard delete antes do histórico avançado.
- FOLLOW-UP: BK-MF0-06 deve registar criação/conclusão no histórico.
- Assunção a validar com o orientador: rotinas pessoais não pertencem a turmas.
- Decisão dependente de mockup: ecrã de rotinas ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para rotinas e objetivos pessoais com CRUD, ownership e validação P1.
