# BK-MF0-06 - O aluno pode consultar histórico de estudo.

## Header
- `doc_id`: `GUIA-BK-MF0-06`
- `bk_id`: `BK-MF0-06`
- `macro`: `MF0`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF06`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-07`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos criar o histórico de estudo individual do aluno. O histórico deve permitir consultar eventos relevantes, como criação de rotina, conclusão de objetivo, upload de material ou geração de resumo, à medida que esses eventos forem surgindo nos BKs seguintes.

Nesta fase, o histórico pode começar com eventos simples e controlados, sem inventar métricas avançadas. O objetivo é criar o contrato técnico reutilizável: qualquer módulo futuro pode registar um evento de estudo associado ao aluno autenticado.

Como não há código nem mockup específico, este guia define uma estrutura simples com filtros básicos, lista cronológica e estado vazio. O design final pode evoluir sem alterar o contrato base.

## Porque é que isto é importante

- Dá continuidade ao estudo individual.
- Prepara evidência para progresso e métricas futuras.
- Cria um padrão de eventos reutilizável por materiais e IA.
- Ajuda o aluno a perceber o que já fez.
- Mantém isolamento de dados por aluno.

## O que entra (scope)

- Estado esperado antes do BK: aluno autenticado e perfil disponível; rotinas podem ou não existir.
- Estado esperado depois do BK: aluno vê lista cronológica dos seus eventos de estudo.
- Ficheiros a criar/editar:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/modules/study/history.controller.ts`
  - `apps/api/src/modules/study/history.service.ts`
  - `apps/api/src/modules/study/dto/study-event.dto.ts`
  - `apps/web/src/pages/student/StudyHistoryPage.tsx`
  - `apps/web/src/components/study/StudyHistoryList.tsx`
- Ficheiros a rever: BK-MF0-03, BK-MF0-04, BK-MF0-05.
- Dependências de BK anteriores: perfil do BK-MF0-03; rotinas do BK-MF0-05 se já existirem.
- Impacto na arquitetura: cria padrão `StudyEvent`.
- Impacto em frontend: cria lista com filtros simples.
- Impacto em backend: cria endpoint derivado `GET /api/study/history`.
- Impacto em dados: eventos ligados a `userId` e opcionalmente a `studyAreaId`.
- Impacto em segurança: aluno só consulta o próprio histórico.
- Impacto em testes: validar ordenação e ownership.
- Handoff: BK-MF0-07 e BK-MF0-08 devem registar eventos.

## O que não entra (scope-out)

- Estatísticas avançadas ou gráficos complexos.
- Histórico de turma, grupo ou professor.
- Exportação de dados pessoais, que pertence a fase de RGPD.
- Algoritmos de recomendação.
- Auditoria administrativa completa.

## Como saber que isto ficou bem

- Aluno autenticado vê histórico ordenado do mais recente para o mais antigo.
- Aluno sem eventos vê empty state.
- Evento de rotina/objetivo aparece quando existir integração.
- Pedido sem sessão devolve `401`.
- Tentativa de consultar eventos de outro aluno falha.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Kaua` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-03` (CANONICO)
- Pre-condicoes: perfil autenticado e domínio `study` disponível (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDY-HISTORY`
- Fonte de verdade: `docs/RF.md`, `RF06` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-06` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Histórico cronológico de estudo individual (CANONICO)
- `rf_rnf`: `RF06` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudyEvent`.
- Criar service para registar e listar eventos.
- Criar endpoint protegido de histórico.
- Criar UI com lista e empty state.
- Ordenar eventos por data descendente.
- Preparar tipos de eventos para rotinas, materiais e IA.
- Garantir que só o dono vê os eventos.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF06, RF05, RF08, RF11.
- `docs/RNF.md`: RNF03, RNF20, RNF23, RNF42, RNF43.
- BK-MF0-03: perfil.
- BK-MF0-05: rotinas e objetivos.
- `PLANO-SPRINTS.md`: testes P1.

## Glossário (rápido) (DERIVADO):

- **Histórico**: lista de ações passadas do aluno.
- **Evento**: registo individual de uma ação.
- **Timeline**: lista ordenada cronologicamente.
- **Filtro**: forma de limitar resultados, por tipo ou data.
- **Paginação**: dividir resultados em páginas para não carregar tudo.
- **Owner**: dono do evento, neste caso o aluno.
- **Auditoria**: registo técnico de ações sensíveis, mais amplo que este histórico.

## Conceitos teóricos essenciais (DERIVADO):

**Event log funcional.** O histórico pode ser modelado como eventos. Cada evento tem tipo, data, descrição e dono. Isto é mais flexível do que criar uma tabela diferente para cada tipo de atividade.

**Histórico vs auditoria.** Este histórico é para o aluno consultar a sua atividade. Auditoria administrativa completa é outro requisito e deve ter regras mais rigorosas, logs e permissões próprias.

**Paginação.** Mesmo que no MVP haja poucos eventos, a API deve preparar `limit` e `cursor` ou `page`, para evitar carregar milhares de registos no futuro.

**Privacidade.** Eventos de estudo podem revelar hábitos e dificuldades. Por isso, o backend filtra sempre por `userId` da sessão.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): definir tipos de evento mínimos**
   - Descrição detalhada do objetivo: escolher tipos derivados dos BKs da MF0.
   - Justificação: evita inventar métricas sem base funcional.
   - Como fazer (0.1): listar `ROUTINE_CREATED`, `GOAL_COMPLETED`, `MATERIAL_SUBMITTED`, `SUMMARY_GENERATED`.
   - Como fazer (0.2): marcar tipos futuros como TODO se ainda não existirem.
   - Ficheiro a rever: `MF-VIEWS.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/dto/study-event.dto.ts`.
   - Snippet de referência: `type StudyEventType = "ROUTINE_CREATED" | "MATERIAL_SUBMITTED";`
   - O que verificar: nenhum tipo inventa regra de negócio nova.

1. **Objetivo (~30 min): criar modelo StudyEvent**
   - Descrição detalhada do objetivo: guardar eventos por aluno.
   - Justificação: histórico precisa de persistência.
   - Como fazer (1.1): criar `StudyEvent`.
   - Como fazer (1.2): incluir `metadata` opcional para detalhes controlados.
   - Ficheiro a rever: `apps/api/prisma/schema.prisma`.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência:
     ```prisma
     model StudyEvent {
       id        String   @id @default(uuid())
       userId    String
       type      String
       title     String
       createdAt DateTime @default(now())
     }
     ```
   - O que verificar: existe índice por `userId` e `createdAt` quando suportado.

2. **Objetivo (~35 min): criar service de histórico**
   - Descrição detalhada do objetivo: listar eventos do aluno e registar novos eventos.
   - Justificação: outros BKs reutilizam este service.
   - Como fazer (2.1): criar `listMyHistory(userId, filters)`.
   - Como fazer (2.2): criar `recordStudyEvent(userId, event)`.
   - Ficheiro a rever: BK-MF0-05.
   - Ficheiro alvo: `apps/api/src/modules/study/history.service.ts`.
   - Snippet de referência:
     ```ts
     export async function listMyHistory(userId: string) {
       return eventsRepository.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
     }
     ```
   - O que verificar: service não aceita `targetUserId` do cliente.

3. **Objetivo (~25 min): expor endpoint protegido**
   - Descrição detalhada do objetivo: criar API de consulta.
   - Justificação: frontend precisa de histórico real.
   - Como fazer (3.1): criar `GET /api/study/history`.
   - Como fazer (3.2): aceitar filtros simples `type` e `limit`.
   - Ficheiro a rever: BK-MF0-02.
   - Ficheiro alvo: `apps/api/src/modules/study/history.controller.ts`.
   - Snippet de referência:
     ```ts
     // GET /api/study/history?type=MATERIAL_SUBMITTED&limit=20
     ```
   - O que verificar: sem sessão devolve `401`.

4. **Objetivo (~35 min): integrar eventos com rotinas quando possível**
   - Descrição detalhada do objetivo: registar evento quando uma rotina/objetivo é criado ou concluído.
   - Justificação: o histórico deve refletir ações reais.
   - Como fazer (4.1): chamar `recordStudyEvent` no service de rotinas.
   - Como fazer (4.2): se BK-MF0-05 ainda não existir, deixar TODO claro.
   - Ficheiro a rever: `apps/api/src/modules/study/routines.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/study/history.service.ts`.
   - Snippet de referência:
     ```ts
     await recordStudyEvent(userId, { type: "ROUTINE_CREATED", title: input.title });
     ```
   - O que verificar: falha ao registar histórico não deve duplicar rotina.

5. **Objetivo (~40 min): criar página de histórico**
   - Descrição detalhada do objetivo: mostrar timeline simples ao aluno.
   - Justificação: RF06 é uma funcionalidade de consulta visível.
   - Como fazer (5.1): criar `StudyHistoryPage`.
   - Como fazer (5.2): mostrar filtros simples e empty state.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/StudyHistoryPage.tsx`.
   - Snippet de referência:
     ```tsx
     <time dateTime={event.createdAt}>{formatDatePt(event.createdAt)}</time>
     ```
   - O que verificar: datas aparecem em PT-PT.

6. **Objetivo (~35 min): testar e entregar handoff**
   - Descrição detalhada do objetivo: validar listagem, ordenação e negativos.
   - Justificação: materiais e IA vão reutilizar o histórico.
   - Como fazer (6.1): testar lista vazia e lista com eventos.
   - Como fazer (6.2): testar sem sessão e acesso a evento de outro aluno.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/study/history.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(events[0].createdAt >= events[1].createdAt).toBe(true);
     ```
   - O que verificar: evidence identifica como BK-MF0-07 deve registar eventos.

## Checklist de validação (DERIVADO):

- Smoke:
  - Aluno vê histórico vazio.
  - Aluno vê eventos ordenados quando existem.
- Negativos:
  - passo 6; input/ação: pedido sem cookie; resultado esperado: `401`; risco que cobre: exposição de histórico.
  - passo 6; input/ação: tentar filtrar por `userId` de outro aluno; resultado esperado: filtro ignorado/rejeitado; risco que cobre: IDOR.
- Técnico:
  - Eventos ordenados por `createdAt desc`.
  - API suporta limite de resultados.
- Regressão das fases anteriores:
  - Rotinas continuam a criar/editar sem depender do histórico para sucesso crítico.
- UI/mockup:
  - Sem mockup específico; timeline simples e PT-PT.
- Segurança:
  - Histórico nunca aceita `userId` vindo do cliente.

## Critérios de aceite:

- Outputs:
  - Modelo `StudyEvent`.
  - Endpoint `GET /api/study/history`.
  - Página de histórico.
- Verificações:
  - Lista vazia responde `200`.
  - Eventos aparecem ordenados.
- Qualidade:
  - Tipos de evento são derivados dos BKs existentes.
  - Service reutilizável para BKs futuros.
- Continuidade:
  - BK-MF0-07, BK-MF0-08, BK-MF0-11 e BK-MF0-12 podem registar eventos.
- Evidência:
  - PR inclui histórico vazio, histórico com eventos e 2 negativos.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/study/history.*`, `apps/web/src/pages/student/StudyHistoryPage.tsx`
- `commands`: `npm test`, `npm run lint`
- `screenshots`: `A preencher com histórico`
- `notes`: `Histórico funcional não substitui auditoria administrativa`

## TODOs

- TODO: confirmar lista final de tipos de evento.
- TODO: decidir paginação por `cursor` ou `page`.
- FOLLOW-UP: BK-MF0-07 deve registar criação de área.
- Assunção a validar com o orientador: histórico mostra ações do aluno, não métricas avaliativas.
- Decisão dependente de mockup: ecrã de histórico ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para histórico individual com eventos, privacidade e continuidade com materiais/IA.
