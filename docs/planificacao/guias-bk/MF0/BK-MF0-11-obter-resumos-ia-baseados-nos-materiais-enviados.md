# BK-MF0-11 - Obter resumos IA baseados nos materiais enviados.

## Header
- `doc_id`: `GUIA-BK-MF0-11`
- `bk_id`: `BK-MF0-11`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-08, BK-MF0-10`
- `rf_rnf`: `RF11`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-12`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md`
- `last_updated`: `2026-05-24`

## O que vamos fazer neste BK

Neste BK vamos criar o primeiro fluxo de IA visível: gerar um resumo para uma Área de Estudo com base nos materiais enviados pelo aluno. O resumo deve depender de fontes da própria área e nunca deve inventar conteúdo quando o material ainda não está processado.

Como a indexação automática completa aparece mais tarde em RF31/RF32, este BK deve ser honesto tecnicamente. A geração só pode usar materiais que já tenham texto disponível ou conteúdo manual do tipo `TOPIC`. PDF/DOCX em estado `PENDING_PROCESSING` devem bloquear a geração com mensagem clara, em vez de produzir resumo fictício.

O perfil IA do BK-MF0-10 fornece o estado e as preferências pedagógicas da área. A “voz” do BK-MF0-09, quando existir, pode influenciar o estilo do resumo, mas não pode substituir as fontes.

## Porque é que isto é importante

- Entrega valor central da StudyFlow: estudar a partir dos próprios materiais.
- Introduz guardrail contra alucinação desde o primeiro fluxo de IA.
- Reutiliza materiais, área e perfil IA sem duplicar contratos.
- Prepara explicações, cards e quizzes do BK-MF0-12.
- Ensina separação entre prompt, service e provider externo.

## O que entra (scope)

- Estado esperado antes do BK: materiais submetidos e perfil IA criado.
- Estado esperado depois do BK: aluno gera ou tenta gerar resumo com estado controlado.
- Ficheiros a criar/editar:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/src/modules/ai/summaries.controller.ts`
  - `apps/api/src/modules/ai/summaries.service.ts`
  - `apps/api/src/modules/ai/providers/ai-provider.ts`
  - `apps/api/src/modules/ai/prompts/summary.prompt.ts`
  - `apps/api/src/modules/ai/dto/create-summary.dto.ts`
  - `apps/web/src/pages/student/StudyAreaSummariesPage.tsx`
  - `apps/web/src/components/ai/SummaryPanel.tsx`
- Ficheiros a rever: BK-MF0-08, BK-MF0-10, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: materiais do BK-MF0-08 e perfil IA do BK-MF0-10.
- Impacto na arquitetura: cria provider IA isolado, sem espalhar chamadas externas pelo código.
- Impacto em frontend: botão de gerar resumo, estados loading/error/empty/success e fontes.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/summaries`.
- Impacto em dados: cria `AiArtifact` ou `Summary` com fontes.
- Impacto em segurança: não gerar sem fontes processadas e não misturar áreas.
- Impacto em testes: negativos contra ausência de fontes e área alheia.
- Handoff: BK-MF0-12 reutiliza artefactos e fontes para quizzes/cards.

## O que não entra (scope-out)

- Indexação automática completa de PDF/DOCX.
- Conhecimento externo sem permissão.
- Aprovação docente de conteúdos IA.
- Quotas, custos e seleção avançada de modelo.
- Exportação PDF/MD.

## Como saber que isto ficou bem

- Resumo válido referencia materiais usados.
- Se não houver texto fonte, a API bloqueia com erro pedagógico claro.
- Área alheia não pode ser resumida.
- Resposta da IA fica guardada como artefacto da área.
- UI mostra fontes e não apresenta resumo falso.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Natalia` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-08, BK-MF0-10` (CANONICO)
- Pre-condicoes: materiais com texto disponível ou bloqueio claro se estiverem pendentes (DERIVADO)
- Ref. Plano: `Fase 1`, `S02`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-SUMMARY`
- Fonte de verdade: `docs/RF.md`, `RF11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Resumos IA baseados nos materiais enviados (CANONICO)
- `rf_rnf`: `RF11` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo de artefacto IA.
- Criar provider IA isolado por interface.
- Criar prompt de resumo com fontes obrigatórias.
- Criar endpoint de geração de resumo.
- Bloquear geração sem material processado.
- Criar UI de geração e visualização.
- Guardar resumo e fontes.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF10, RF11, RF31, RF38.
- `docs/RNF.md`: RNF09, RNF19, RNF20, RNF31, RNF35, RNF37.
- BK-MF0-08: materiais.
- BK-MF0-10: perfil IA.
- Critérios de aceitação dos RF: resumos devem indicar página/secção quando disponível.

## Glossário (rápido) (DERIVADO):

- **Artefacto IA**: conteúdo gerado e guardado, como resumo.
- **Provider IA**: camada que chama o serviço de IA.
- **Prompt**: instrução enviada ao modelo.
- **Fonte**: material usado como base factual.
- **Alucinação**: conteúdo inventado sem suporte.
- **Fallback**: comportamento quando a IA não pode responder.
- **Citação**: referência à origem do conteúdo.
- **Material processado**: material com texto utilizável pela IA.

## Conceitos teóricos essenciais (DERIVADO):

**IA baseada em fontes.** O resumo deve ser criado a partir de textos disponíveis. Se o PDF ainda não foi extraído, o sistema não deve adivinhar o conteúdo.

**Provider isolado.** Chamadas a OpenAI ou outro serviço devem ficar atrás de uma interface. Assim, testes podem usar stub e a app não fica dependente de detalhes do fornecedor.

**Guardrails de geração.** O prompt deve dizer explicitamente para resumir apenas as fontes fornecidas. O service também deve validar fontes antes de chamar a IA.

**Fallback honesto.** Quando faltam fontes, a resposta correta é bloquear e explicar o que falta, não criar conteúdo genérico.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~20 min): confirmar pré-condição de fontes**
   - Descrição detalhada do objetivo: decidir que materiais pendentes não podem gerar resumo factual.
   - Justificação: evita alucinação.
   - Como fazer (0.1): rever RF11, RF31 e RNF35.
   - Como fazer (0.2): documentar estados aceites: `READY` ou texto manual disponível.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/summaries.service.ts`.
   - Snippet de referência: `if (sources.length === 0) throw new Error("NO_PROCESSABLE_SOURCES");`
   - O que verificar: materiais pendentes bloqueiam geração.

1. **Objetivo (~35 min): criar modelo de artefacto IA**
   - Descrição detalhada do objetivo: guardar resumos e fontes usadas.
   - Justificação: aluno pode consultar depois e defender evidência.
   - Como fazer (1.1): criar `AiArtifact` com `type`, `studyAreaId`, `content`, `sources`.
   - Como fazer (1.2): associar ao `userId`.
   - Ficheiro a rever: `apps/api/prisma/schema.prisma`.
   - Ficheiro alvo: `apps/api/prisma/schema.prisma`.
   - Snippet de referência:
     ```prisma
     model AiArtifact {
       id          String @id @default(uuid())
       userId      String
       studyAreaId String
       type        String
       contentJson Json
       sourcesJson Json
     }
     ```
   - O que verificar: fontes ficam guardadas.

2. **Objetivo (~35 min): criar interface de provider IA**
   - Descrição detalhada do objetivo: separar app de fornecedor externo.
   - Justificação: facilita testes e troca de provider.
   - Como fazer (2.1): definir `generateSummary(input)`.
   - Como fazer (2.2): criar stub apenas para testes, não para produção.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/providers/ai-provider.ts`.
   - Snippet de referência:
     ```ts
     export interface AiProvider {
       generateSummary(input: SummaryPromptInput): Promise<SummaryResult>;
     }
     ```
   - O que verificar: controller não chama provider diretamente.

3. **Objetivo (~40 min): criar prompt de resumo com guardrails**
   - Descrição detalhada do objetivo: orientar IA para usar apenas fontes.
   - Justificação: reduz risco de invenção.
   - Como fazer (3.1): montar prompt com título da área, voz e excertos.
   - Como fazer (3.2): exigir lista de fontes usadas.
   - Ficheiro a rever: BK-MF0-09.
   - Ficheiro alvo: `apps/api/src/modules/ai/prompts/summary.prompt.ts`.
   - Snippet de referência:
     ```ts
     return `Resume apenas as fontes fornecidas. Se faltar informação, diz que falta fonte.`;
     ```
   - O que verificar: prompt não permite conhecimento externo.

4. **Objetivo (~45 min): implementar service de resumo**
   - Descrição detalhada do objetivo: validar área, perfil, fontes e chamar provider.
   - Justificação: regra principal fica numa camada testável.
   - Como fazer (4.1): obter `AiAreaProfile`.
   - Como fazer (4.2): carregar fontes processáveis da área.
   - Ficheiro a rever: BK-MF0-10.
   - Ficheiro alvo: `apps/api/src/modules/ai/summaries.service.ts`.
   - Snippet de referência:
     ```ts
     const result = await aiProvider.generateSummary({ sources, voiceTone: profile.voiceTone });
     ```
   - O que verificar: área alheia falha antes de chamar provider.

5. **Objetivo (~30 min): expor endpoint**
   - Descrição detalhada do objetivo: criar API para gerar resumo.
   - Justificação: frontend precisa de ação explícita.
   - Como fazer (5.1): criar `POST /api/study-areas/:id/summaries`.
   - Como fazer (5.2): criar `GET /api/study-areas/:id/summaries`.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/summaries.controller.ts`.
   - Snippet de referência:
     ```ts
     // 201: { id, type: "SUMMARY", content, sources }
     ```
   - O que verificar: sem sessão devolve `401`.

6. **Objetivo (~45 min): criar UI de resumos**
   - Descrição detalhada do objetivo: permitir gerar e consultar resumo.
   - Justificação: RF11 precisa de experiência visível.
   - Como fazer (6.1): criar `StudyAreaSummariesPage`.
   - Como fazer (6.2): mostrar fontes, loading, erro sem fontes e resumo.
   - Ficheiro a rever: BK-MF0-08.
   - Ficheiro alvo: `apps/web/src/components/ai/SummaryPanel.tsx`.
   - Snippet de referência:
     ```tsx
     <button disabled={!profileReady}>Gerar resumo</button>
     ```
   - O que verificar: botão bloqueia quando não há fontes.

7. **Objetivo (~40 min): registar histórico e erros**
   - Descrição detalhada do objetivo: guardar evento de resumo e erros controlados.
   - Justificação: melhora rastreabilidade para defesa.
   - Como fazer (7.1): criar evento `SUMMARY_GENERATED`.
   - Como fazer (7.2): mapear falhas de provider para mensagem segura.
   - Ficheiro a rever: BK-MF0-06.
   - Ficheiro alvo: `apps/api/src/modules/ai/summaries.service.ts`.
   - Snippet de referência: `throw new ServiceUnavailableException("AI_PROVIDER_UNAVAILABLE")`.
   - O que verificar: falhas externas não expõem API keys.

8. **Objetivo (~45 min): testar negativos e handoff para BK-MF0-12**
   - Descrição detalhada do objetivo: validar geração e falhas.
   - Justificação: BK-MF0-12 reutiliza fontes e artefactos.
   - Como fazer (8.1): testar resumo com fonte processável.
   - Como fazer (8.2): testar sem fontes, área alheia e provider indisponível.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/summaries.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(summary.sources.length).toBeGreaterThan(0);
     ```
   - O que verificar: evidence inclui resumo e fontes.

## Checklist de validação (DERIVADO):

- Smoke:
  - Gerar resumo com fonte processável.
  - Consultar resumo guardado.
- Negativos:
  - passo 8; input/ação: área sem fontes processáveis; resultado esperado: `409` ou `422`; risco que cobre: resumo inventado.
  - passo 8; input/ação: área de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
  - passo 8; input/ação: provider IA indisponível; resultado esperado: `503` controlado; risco que cobre: falha externa.
- Técnico:
  - Resumo guarda fontes.
  - Provider isolado por interface.
- Regressão das fases anteriores:
  - Materiais e perfil IA continuam válidos.
- UI/mockup:
  - Sem mockup específico; painel deve mostrar fontes e erro claro.
- Segurança:
  - Sem conhecimento externo sem permissão.
  - Sem API keys em logs/respostas.

## Critérios de aceite:

- Outputs:
  - Modelo `AiArtifact`.
  - Endpoint de resumos.
  - UI de geração/consulta.
- Verificações:
  - Resumo válido responde `201`.
  - Sem fontes responde erro controlado.
- Qualidade:
  - IA só usa fontes da área.
  - Erros externos tratados explicitamente.
- Continuidade:
  - BK-MF0-12 reutiliza artefacto/fonte.
- Evidência:
  - PR inclui resumo, fontes e 3 negativos.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/ai/summaries.*`, `apps/web/src/components/ai/SummaryPanel.tsx`
- `commands`: `npm test`, `npm run test:e2e`, `npm run lint`
- `screenshots`: `A preencher com resumo e fontes`
- `notes`: `PDF/DOCX sem texto extraído devem bloquear geração`

## TODOs

- TODO: confirmar provider IA e modelo antes de produção.
- TODO (BLOCKER): resumo factual de PDF/DOCX depende de texto extraído/indexado; se ainda não existir, bloquear.
- FOLLOW-UP: BK-MF0-12 deve reutilizar fontes do resumo.
- Assunção a validar com o orientador: tópicos manuais podem servir como fonte inicial controlada.
- Decisão dependente de mockup: ecrã de resumos ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para resumos IA com fontes obrigatórias, fallback honesto e provider isolado.
