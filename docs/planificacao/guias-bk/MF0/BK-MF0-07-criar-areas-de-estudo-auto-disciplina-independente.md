# BK-MF0-07 - Criar “Áreas de Estudo” (auto-disciplina independente).

## Header
- `doc_id`: `GUIA-BK-MF0-07`
- `bk_id`: `BK-MF0-07`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF07`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-08`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos criar as Áreas de Estudo pessoais do aluno. Uma área é uma auto-disciplina independente, por exemplo `Matemática A`, `Português` ou `Projeto PAP`, criada pelo aluno para organizar materiais, preferências e interações futuras com IA.

Este BK corrige uma decisão importante: áreas de estudo não são turmas nem disciplinas oficiais de professor. São contexto privado do aluno e devem ficar isoladas dos módulos de turma que só surgem depois.

O mockup não tem ecrã de áreas. A UI deve ser simples e extensível: lista de áreas, formulário de criação, página de detalhe e estado vazio. O design final pode evoluir sem mudar o contrato.

## Porque é que isto é importante

- Desbloqueia submissão de materiais do BK-MF0-08.
- Cria o contexto do perfil de IA no BK-MF0-10.
- Separa estudo individual de turmas oficiais.
- Ajuda a manter materiais e respostas da IA organizados por tema.
- Prepara isolamento de dados, essencial para segurança e privacidade.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado com perfil.
- Estado esperado depois do BK: aluno cria, lista, edita e arquiva áreas de estudo próprias.
- Ficheiros a criar/editar:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/modules/study-areas/study-areas.controller.ts`
  - `apps/api/src/modules/study-areas/study-areas.service.ts`
  - `apps/api/src/modules/study-areas/dto/create-study-area.dto.ts`
  - `apps/api/src/modules/study-areas/dto/update-study-area.dto.ts`
  - `apps/web/src/pages/student/StudyAreasPage.tsx`
  - `apps/web/src/pages/student/StudyAreaDetailPage.tsx`
  - `apps/web/src/components/study/StudyAreaForm.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, BK-MF0-06.
- Dependências de BK anteriores: perfil do BK-MF0-03; dashboard do BK-MF0-04 se já implementado.
- Impacto na arquitetura: cria domínio `study-areas`.
- Impacto em frontend: lista e detalhe de áreas.
- Impacto em backend: endpoints derivados `GET/POST/PATCH /api/study-areas`.
- Impacto em dados: cria `StudyArea` com dono `userId`.
- Impacto em segurança: cada área é privada do aluno.
- Impacto em testes: validar duplicação, ownership e campos obrigatórios.
- Handoff: BK-MF0-08 deve receber `studyAreaId` válido.

## O que não entra (scope-out)

- Materiais da área, que pertencem ao BK-MF0-08.
- Perfil de IA da área, que pertence ao BK-MF0-10.
- Disciplinas oficiais e turmas, que pertencem à MF1.
- Partilha com colegas ou salas de estudo.
- IA privada funcional, que vem depois.

## Como saber que isto ficou bem

- Aluno cria uma área com nome válido.
- Aluno vê apenas as suas áreas.
- Detalhe da área mostra placeholders para materiais e IA.
- Nome duplicado no mesmo aluno é tratado.
- Tentativa de aceder a área de outro aluno falha.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: aluno autenticado com perfil (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-AREAS`
- Fonte de verdade: `docs/RF.md`, `RF07` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-07` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Áreas de Estudo privadas do aluno (CANONICO)
- `rf_rnf`: `RF07` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudyArea`.
- Criar DTOs de criação e edição.
- Criar endpoints protegidos.
- Criar lista e detalhe no frontend.
- Registar evento `STUDY_AREA_CREATED` no histórico, se BK-MF0-06 estiver disponível.
- Preparar placeholders para materiais e IA.
- Garantir isolamento por `userId`.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF07, RF08, RF10, RF35.
- `docs/RNF.md`: RNF20, RNF25, RNF26, RNF42.
- BK-MF0-03: perfil do aluno.
- BK-MF0-04: dashboard individual.
- BK-MF0-06: histórico, se implementado.

## Glossário (rápido) (DERIVADO):

- **Área de Estudo**: espaço privado para organizar estudo de um tema/disciplina informal.
- **Auto-disciplina**: área criada pelo aluno, não oficializada por professor.
- **Contexto**: conjunto de dados que limita materiais e IA a uma área.
- **Slug**: versão curta do nome para URL, se a equipa decidir usar.
- **Arquivar**: esconder sem apagar definitivamente.
- **Ownership**: área pertence a um aluno.
- **IDOR**: ataque em que se tenta aceder a recurso de outro utilizador mudando o ID.

## Conceitos teóricos essenciais (DERIVADO):

**Contexto de estudo.** A área de estudo é o primeiro contexto real da IA privada. Materiais, voz, perfil IA, resumos e quizzes devem ficar ligados a uma área para evitar mistura de assuntos.

**CRUD com autorização.** Criar e listar é simples, mas editar ou abrir detalhe exige confirmar que a área pertence ao aluno autenticado. Isto evita IDOR.

**Separação de domínio.** `study-areas` deve ficar separado de `students` e `auth`. Auth responde a quem é o utilizador; study-areas responde ao que ele está a estudar.

**Placeholder controlado.** A página de detalhe pode mostrar zonas `Materiais` e `IA`, mas deve indicar que serão ativadas nos BKs seguintes, sem simular resultados.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): definir fronteira entre área e turma**
   - Descrição detalhada do objetivo: garantir que área é privada e não oficial.
   - Justificação: evita conflito com MF1.
   - Como fazer (0.1): rever RF07 e RF19-RF21.
   - Como fazer (0.2): documentar que `StudyArea` usa `userId`, não `classId`.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência: `userId String`.
   - O que verificar: não há dependência de turmas.

1. **Objetivo (~30 min): criar modelo StudyArea**
   - Descrição detalhada do objetivo: persistir áreas do aluno.
   - Justificação: materiais e IA precisam de `studyAreaId`.
   - Como fazer (1.1): criar campos `name`, `description`, `color`, `archived`.
   - Como fazer (1.2): criar índice por `userId`.
   - Ficheiro a rever: `apps/api/prisma/schema.prisma`.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência:
     ```prisma
     model StudyArea {
       id          String  @id @default(uuid())
       userId      String
       name        String
       description String?
       archived    Boolean @default(false)
     }
     ```
   - O que verificar: área tem dono obrigatório.

2. **Objetivo (~30 min): criar DTOs e validações**
   - Descrição detalhada do objetivo: controlar entrada da API.
   - Justificação: nome vazio ou demasiado longo cria má experiência.
   - Como fazer (2.1): criar `CreateStudyAreaDto`.
   - Como fazer (2.2): validar `name` obrigatório e `description` opcional.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/study-areas/dto/create-study-area.dto.ts`.
   - Snippet de referência:
     ```ts
     export type CreateStudyAreaDto = {
       name: string;
       description?: string;
     };
     ```
   - O que verificar: `userId` não vem no DTO.

3. **Objetivo (~40 min): implementar service com ownership**
   - Descrição detalhada do objetivo: criar, listar e obter detalhe de áreas.
   - Justificação: o service protege o acesso por dono.
   - Como fazer (3.1): criar `listMyStudyAreas(userId)`.
   - Como fazer (3.2): criar `getMyStudyArea(userId, areaId)`.
   - Ficheiro a rever: BK-MF0-06.
   - Ficheiro alvo: `apps/api/src/modules/study-areas/study-areas.service.ts`.
   - Snippet de referência:
     ```ts
     return repository.findFirst({ where: { id: areaId, userId } });
     ```
   - O que verificar: área de outro aluno não é encontrada.

4. **Objetivo (~30 min): expor endpoints**
   - Descrição detalhada do objetivo: criar API REST protegida.
   - Justificação: frontend e BK-MF0-08 precisam deste contrato.
   - Como fazer (4.1): criar `GET /api/study-areas`.
   - Como fazer (4.2): criar `POST /api/study-areas` e `GET /api/study-areas/:id`.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/study-areas/study-areas.controller.ts`.
   - Snippet de referência:
     ```ts
     // POST /api/study-areas -> 201 { id, name, description }
     ```
   - O que verificar: sem sessão devolve `401`.

5. **Objetivo (~40 min): criar páginas de lista e detalhe**
   - Descrição detalhada do objetivo: permitir criar e abrir áreas.
   - Justificação: RF07 é funcionalidade principal visível.
   - Como fazer (5.1): criar `StudyAreasPage`.
   - Como fazer (5.2): criar `StudyAreaDetailPage` com placeholders para materiais e IA.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/StudyAreasPage.tsx`.
   - Snippet de referência:
     ```tsx
     <button type="submit">Criar área</button>
     ```
   - O que verificar: empty state orienta para criar primeira área.

6. **Objetivo (~25 min): ligar ao dashboard e histórico**
   - Descrição detalhada do objetivo: adicionar atalho e evento de criação.
   - Justificação: mantém continuidade com BK-MF0-04 e BK-MF0-06.
   - Como fazer (6.1): atualizar contador de áreas no dashboard.
   - Como fazer (6.2): chamar `recordStudyEvent` se disponível.
   - Ficheiro a rever: `apps/api/src/modules/study/history.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/study-areas/study-areas.service.ts`.
   - Snippet de referência: `STUDY_AREA_CREATED`.
   - O que verificar: se histórico não existir, deixar TODO sem bloquear criação.

7. **Objetivo (~40 min): testar negativos e continuidade**
   - Descrição detalhada do objetivo: validar criação, listagem e ownership.
   - Justificação: P0 exige 3 negativos.
   - Como fazer (7.1): testar nome vazio, sem sessão e área de outro aluno.
   - Como fazer (7.2): testar criação válida seguida de listagem.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/study-areas/study-areas.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(await getMyStudyArea(userA.id, areaOfUserB.id)).toBeNull();
     ```
   - O que verificar: negativos não devolvem `500`.

8. **Objetivo (~20 min): preparar handoff para materiais**
   - Descrição detalhada do objetivo: documentar `studyAreaId` como dependência do upload.
   - Justificação: BK-MF0-08 só deve aceitar materiais dentro de área válida.
   - Como fazer (8.1): guardar ID de área de teste na evidence.
   - Como fazer (8.2): indicar endpoint que o próximo BK deve usar.
   - Ficheiro a rever: `MF-VIEWS.md`.
   - Ficheiro alvo: evidence do PR.
   - Snippet de referência: `POST /api/study-areas/{id}/materials`.
   - O que verificar: handoff inclui área válida e área inválida.

## Checklist de validação (DERIVADO):

- Smoke:
  - Criar área válida.
  - Abrir detalhe da área criada.
- Negativos:
  - passo 7; input/ação: nome vazio; resultado esperado: `400`; risco que cobre: dados inválidos.
  - passo 7; input/ação: pedido sem sessão; resultado esperado: `401`; risco que cobre: acesso público.
  - passo 7; input/ação: abrir área de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
- Técnico:
  - Todas as queries filtram por `userId`.
  - `studyAreaId` é estável para BKs seguintes.
- Regressão das fases anteriores:
  - Dashboard individual atualiza contador de áreas.
- UI/mockup:
  - Sem mockup específico; UI simples e extensível.
- Segurança:
  - Não aceitar `userId` no body.

## Critérios de aceite:

- Outputs:
  - Modelo `StudyArea`.
  - API de áreas protegida.
  - Lista e detalhe no frontend.
- Verificações:
  - Criação válida responde `201`.
  - Acesso a área alheia falha.
- Qualidade:
  - Áreas não dependem de turmas.
  - Código separado por domínio.
- Continuidade:
  - BK-MF0-08 usa `studyAreaId`.
  - BK-MF0-10 cria perfil IA por área.
- Evidência:
  - PR inclui smoke, 3 negativos e screenshot da lista.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/study-areas/*`, `apps/web/src/pages/student/StudyAreasPage.tsx`
- `commands`: `npm test`, `npm run test:e2e`, `npm run lint`
- `screenshots`: `A preencher com lista/detalhe de áreas`
- `notes`: `Áreas privadas não substituem disciplinas oficiais`

## TODOs

- TODO: confirmar se `color` entra no MVP ou fica visual apenas.
- TODO: decidir regra de nomes duplicados por aluno.
- FOLLOW-UP: BK-MF0-08 deve validar `studyAreaId`.
- Assunção a validar com o orientador: áreas são privadas e independentes de turma.
- Decisão dependente de mockup: ecrã de áreas ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para áreas privadas, ownership e handoff para materiais/IA.
