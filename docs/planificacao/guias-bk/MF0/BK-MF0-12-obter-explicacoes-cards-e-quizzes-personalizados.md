# BK-MF0-12 - Obter explicações, cards e quizzes personalizados.

## Header
- `doc_id`: `GUIA-BK-MF0-12`
- `bk_id`: `BK-MF0-12`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-11`
- `rf_rnf`: `RF12`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-01`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos criar ferramentas de estudo geradas por IA a partir dos materiais e resumos da Área de Estudo: explicações, cards e quizzes personalizados. Tal como no BK-MF0-11, a geração deve ser baseada em fontes disponíveis e não pode inventar matéria.

O requisito RF12 fala em personalização, mas a adaptação profunda ao ritmo/dificuldades do aluno só entra no BK-MF1-01/RF13. Nesta fase, “personalizado” significa respeitar a área de estudo, os materiais, o tom configurado e o histórico básico disponível, sem criar perfis psicológicos ou métricas não definidas.

O output deste BK fecha a MF0 e prepara a MF1. O próximo BK vai melhorar a adaptação ao ritmo e dificuldades, por isso este BK deve guardar resultados e feedback mínimo para reutilização futura.

## Porque é que isto é importante

- Completa o fluxo individual: área -> materiais -> perfil IA -> resumo -> ferramentas de estudo.
- Cria formatos úteis para aprendizagem autónoma.
- Prepara dados para adaptação futura ao aluno.
- Reforça guardrails contra alucinação e respostas sem fontes.
- Introduz validação específica de quizzes, incluindo resposta correta e distratores.

## O que entra (scope)

- Estado esperado antes do BK: resumo/fonte processável criado no BK-MF0-11.
- Estado esperado depois do BK: aluno gera explicação, cards e quiz com fontes.
- Ficheiros a criar/editar:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/modules/ai/study-tools.controller.ts`
  - `apps/api/src/modules/ai/study-tools.service.ts`
  - `apps/api/src/modules/ai/prompts/study-tools.prompt.ts`
  - `apps/api/src/modules/ai/dto/create-study-tool.dto.ts`
  - `apps/api/src/modules/ai/validators/quiz.validator.ts`
  - `apps/web/src/pages/student/StudyToolsPage.tsx`
  - `apps/web/src/components/ai/ExplanationPanel.tsx`
  - `apps/web/src/components/ai/FlashcardsPanel.tsx`
  - `apps/web/src/components/ai/QuizPanel.tsx`
- Ficheiros a rever: BK-MF0-11, BK-MF0-10, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `BK-MF0-11`.
- Impacto na arquitetura: reutiliza `AiArtifact` com tipos `EXPLANATION`, `FLASHCARDS`, `QUIZ`.
- Impacto em frontend: páginas/painéis de estudo interativo.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/study-tools`.
- Impacto em dados: artefactos IA guardados com fontes e tipo.
- Impacto em segurança: não gerar sem fontes e validar estrutura do quiz.
- Impacto em testes: negativos contra fonte ausente, quiz inválido e área alheia.
- Handoff: BK-MF1-01 usa feedback e histórico para adaptação ao ritmo.

## O que não entra (scope-out)

- Adaptação avançada ao ritmo/dificuldades, que pertence ao BK-MF1-01.
- Testes oficiais de professor, que pertencem a RF28.
- Aprovação docente de conteúdos IA, que pertence a RF29.
- Exportação PDF/MD.
- Conhecimento externo ou web search.

## Como saber que isto ficou bem

- Explicação, cards e quiz são gerados apenas com fontes da área.
- Quiz tem perguntas de escolha múltipla com 1 resposta correta e 3 distratores.
- Artefactos guardam fontes.
- UI mostra loading, erro sem fontes e resultado.
- Área alheia ou fonte ausente não gera conteúdo.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-11` (CANONICO)
- Pre-condicoes: resumo ou fontes processáveis disponíveis (DERIVADO)
- Ref. Plano: `Fase 1`, `S02`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-STUDY-TOOLS`
- Fonte de verdade: `docs/RF.md`, `RF12` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-12` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Explicações, cards e quizzes personalizados por área (CANONICO)
- `rf_rnf`: `RF12` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Reutilizar `AiArtifact` para novos tipos.
- Criar prompts separados para explicação, cards e quiz.
- Validar fontes antes de gerar.
- Validar estrutura do quiz depois de gerar.
- Criar UI para cada tipo de ferramenta.
- Guardar artefactos e fontes.
- Preparar feedback/histórico para MF1.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF11, RF12, RF13, RF28, RF29.
- Critérios de aceitação em `docs/RF.md`: quizzes e resumos.
- `docs/RNF.md`: RNF19, RNF31, RNF35, RNF36.
- BK-MF0-11: resumo e fontes.
- BK-MF0-10: perfil IA.
- BK-MF0-06: histórico.

## Glossário (rápido) (DERIVADO):

- **Explicação**: texto didático sobre um tópico/fonte.
- **Flashcard/Card**: par pergunta-resposta curto para revisão.
- **Quiz**: conjunto de perguntas com opções.
- **Distrator**: opção errada mas plausível num MCQ.
- **MCQ**: pergunta de escolha múltipla.
- **Fonte**: material que justifica o conteúdo gerado.
- **Validador de output**: código que confirma se a resposta da IA tem formato aceitável.
- **Feedback**: resposta do aluno a uma ferramenta, útil para adaptação futura.

## Conceitos teóricos essenciais (DERIVADO):

**Geração estruturada.** Cards e quizzes devem sair num formato previsível, por exemplo JSON validado. Texto livre é difícil de testar e pode partir a UI.

**Validação pós-IA.** Mesmo que o prompt peça 1 resposta correta e 3 distratores, o backend deve validar. A IA pode falhar o formato; nesse caso a API deve devolver erro controlado ou tentar novamente dentro de limites definidos.

**Personalização inicial.** Nesta fase a personalização usa área, tom e fontes. A adaptação ao ritmo/dificuldades fica para o próximo BK para não inventar métricas ainda inexistentes.

**Separação entre recomendação e avaliação oficial.** Quizzes deste BK são ferramentas de estudo, não testes oficiais de professor. Essa distinção evita confusão com RF28/RF29.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~20 min): confirmar formatos e limites**
   - Descrição detalhada do objetivo: definir tipos `EXPLANATION`, `FLASHCARDS`, `QUIZ`.
   - Justificação: evita endpoint genérico e ambíguo.
   - Como fazer (0.1): rever RF12 e critérios de quiz.
   - Como fazer (0.2): definir número inicial de cards/perguntas como assunção técnica.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/dto/create-study-tool.dto.ts`.
   - Snippet de referência:
     ```ts
     export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";
     ```
   - O que verificar: não confundir quiz de estudo com teste oficial.

1. **Objetivo (~30 min): reutilizar modelo AiArtifact**
   - Descrição detalhada do objetivo: guardar ferramentas como artefactos.
   - Justificação: resumos e ferramentas partilham fontes, tipo e conteúdo.
   - Como fazer (1.1): confirmar que `AiArtifact.type` aceita novos tipos.
   - Como fazer (1.2): guardar `sourcesJson` em todos os artefactos.
   - Ficheiro a rever: BK-MF0-11.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência: `type: "QUIZ"`.
   - O que verificar: não criar tabela redundante sem necessidade.

2. **Objetivo (~40 min): criar prompts por tipo**
   - Descrição detalhada do objetivo: gerar instruções específicas.
   - Justificação: explicação, cards e quiz têm estruturas diferentes.
   - Como fazer (2.1): criar prompt para explicação com fonte.
   - Como fazer (2.2): criar prompt para cards/quiz em JSON.
   - Ficheiro a rever: `apps/api/src/modules/ai/prompts/summary.prompt.ts`.
   - Ficheiro alvo: `apps/api/src/modules/ai/prompts/study-tools.prompt.ts`.
   - Snippet de referência:
     ```ts
     return `Cria perguntas apenas com base nas fontes. Cada MCQ tem 1 correta e 3 distratores.`;
     ```
   - O que verificar: prompt proíbe informação externa.

3. **Objetivo (~35 min): validar fontes e perfil**
   - Descrição detalhada do objetivo: garantir que há contexto suficiente.
   - Justificação: sem fontes, a IA inventa.
   - Como fazer (3.1): reutilizar carregamento de fontes do BK-MF0-11.
   - Como fazer (3.2): bloquear quando `sources.length === 0`.
   - Ficheiro a rever: `apps/api/src/modules/ai/summaries.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/ai/study-tools.service.ts`.
   - Snippet de referência:
     ```ts
     if (!sources.length) throw new Error("NO_PROCESSABLE_SOURCES");
     ```
   - O que verificar: materiais pendentes não geram tools.

4. **Objetivo (~45 min): implementar service de ferramentas**
   - Descrição detalhada do objetivo: gerar, validar e guardar artefactos.
   - Justificação: controller deve ficar fino.
   - Como fazer (4.1): criar `generateStudyTool(userId, areaId, input)`.
   - Como fazer (4.2): chamar provider através da interface existente.
   - Ficheiro a rever: BK-MF0-11.
   - Ficheiro alvo: `apps/api/src/modules/ai/study-tools.service.ts`.
   - Snippet de referência:
     ```ts
     const generated = await aiProvider.generateStudyTool({ type: input.type, sources, voiceTone });
     ```
   - O que verificar: área alheia falha antes da IA.

5. **Objetivo (~35 min): validar quizzes**
   - Descrição detalhada do objetivo: confirmar estrutura MCQ.
   - Justificação: RF exige 1 correta e 3 distratores.
   - Como fazer (5.1): criar `validateQuizArtifact`.
   - Como fazer (5.2): rejeitar pergunta sem fonte ou com opções erradas.
   - Ficheiro a rever: critérios de aceitação em `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/validators/quiz.validator.ts`.
   - Snippet de referência:
     ```ts
     if (question.options.length !== 4) throw new Error("INVALID_QUIZ_OPTIONS");
     ```
   - O que verificar: cada pergunta tem exatamente uma correta.

6. **Objetivo (~30 min): expor endpoint**
   - Descrição detalhada do objetivo: criar API para gerar ferramentas.
   - Justificação: frontend precisa de pedir tipo específico.
   - Como fazer (6.1): criar `POST /api/study-areas/:id/study-tools`.
   - Como fazer (6.2): criar `GET /api/study-areas/:id/study-tools`.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/study-tools.controller.ts`.
   - Snippet de referência:
     ```ts
     // body: { type: "QUIZ", topic?: string }
     ```
   - O que verificar: endpoint exige sessão.

7. **Objetivo (~50 min): criar UI de explicações, cards e quizzes**
   - Descrição detalhada do objetivo: permitir gerar e usar ferramentas.
   - Justificação: RF12 precisa de experiência prática.
   - Como fazer (7.1): criar tabs ou selector por tipo.
   - Como fazer (7.2): mostrar fontes em cada resultado.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/StudyToolsPage.tsx`.
   - Snippet de referência:
     ```tsx
     <button type="button">Gerar quiz</button>
     ```
   - O que verificar: UI mostra erro quando faltam fontes.

8. **Objetivo (~35 min): registar feedback e histórico mínimo**
   - Descrição detalhada do objetivo: preparar adaptação futura sem implementar RF13.
   - Justificação: BK-MF1-01 precisa de sinais básicos.
   - Como fazer (8.1): registar evento `STUDY_TOOL_GENERATED`.
   - Como fazer (8.2): opcionalmente guardar resposta simples do aluno no quiz como `TODO` se não couber.
   - Ficheiro a rever: BK-MF0-06.
   - Ficheiro alvo: `apps/api/src/modules/ai/study-tools.service.ts`.
   - Snippet de referência: `STUDY_TOOL_GENERATED`.
   - O que verificar: não criar métricas avançadas inventadas.

9. **Objetivo (~50 min): testar negativos e fechar MF0**
   - Descrição detalhada do objetivo: validar caminho feliz e falhas críticas.
   - Justificação: este é o handoff para MF1.
   - Como fazer (9.1): testar cada tipo com fonte válida.
   - Como fazer (9.2): testar sem fontes, quiz inválido e área alheia.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/study-tools.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(quiz.questions[0].options).toHaveLength(4);
     ```
   - O que verificar: evidence inclui contrato para BK-MF1-01.

## Checklist de validação (DERIVADO):

- Smoke:
  - Gerar explicação com fonte.
  - Gerar cards com fonte.
  - Gerar quiz com fonte.
- Negativos:
  - passo 9; input/ação: área sem fontes processáveis; resultado esperado: `409` ou `422`; risco que cobre: conteúdo inventado.
  - passo 9; input/ação: provider devolve quiz com 2 respostas corretas; resultado esperado: artefacto rejeitado; risco que cobre: avaliação incorreta.
  - passo 9; input/ação: área de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
- Técnico:
  - Todos os artefactos guardam fontes.
  - Quiz passa validador estrutural.
- Regressão das fases anteriores:
  - Resumos continuam acessíveis.
  - Perfil IA e materiais continuam a ser as fontes.
- UI/mockup:
  - Sem mockup específico; UI com tabs/selector simples e PT-PT.
- Segurança:
  - Sem conhecimento externo.
  - Sem exposição de API keys ou prompts internos ao utilizador.

## Critérios de aceite:

- Outputs:
  - Endpoint de study tools.
  - UI de explicações, cards e quizzes.
  - Validador de quiz.
- Verificações:
  - Cada tipo gera artefacto com fontes.
  - Quiz tem 1 correta e 3 distratores por pergunta.
  - Sem fontes bloqueia.
- Qualidade:
  - Prompts separados por tipo.
  - Provider isolado.
  - Personalização limitada ao contexto existente.
- Continuidade:
  - BK-MF1-01 consegue reutilizar histórico/feedback mínimo.
  - MF1 não precisa reescrever materiais, perfil IA ou artefactos.
- Evidência:
  - PR inclui outputs dos 3 tipos e 3 negativos.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/ai/study-tools.*`, `apps/api/src/modules/ai/validators/quiz.validator.ts`, `apps/web/src/pages/student/StudyToolsPage.tsx`
- `commands`: `npm test`, `npm run test:e2e`, `npm run lint`
- `screenshots`: `A preencher com explicação/cards/quiz`
- `notes`: `Adaptação avançada ao ritmo fica para BK-MF1-01`

## TODOs

- TODO: confirmar quantidade inicial de cards e perguntas por quiz.
- TODO: decidir como guardar respostas do aluno sem criar métricas avançadas prematuras.
- TODO (BLOCKER): geração factual continua dependente de fontes processáveis.
- FOLLOW-UP: BK-MF1-01 deve usar feedback e histórico para adaptar explicações.
- Assunção a validar com o orientador: quizzes deste BK são estudo, não avaliação oficial.
- Decisão dependente de mockup: ecrã de study tools ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para explicações, cards e quizzes com fontes, validador e handoff para MF1.
