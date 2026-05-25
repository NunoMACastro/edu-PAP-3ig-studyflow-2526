# BK-MF0-10 - Criar perfil IA da Área de Estudo.

## Header
- `doc_id`: `GUIA-BK-MF0-10`
- `bk_id`: `BK-MF0-10`
- `macro`: `MF0`
- `owner`: `Daniel`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-08`
- `rf_rnf`: `RF10`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-11`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md`
- `last_updated`: `2026-05-25`

## O que vamos fazer neste BK

Neste BK vamos criar o perfil IA de uma Área de Estudo. O perfil IA é um contrato interno que junta a área, os materiais submetidos, o tom configurado e regras mínimas para futuras respostas. Ainda não é uma chamada real ao modelo, é a preparação estruturada do contexto.

O perfil IA deve ser criado apenas para uma área que pertença ao aluno e que tenha materiais submetidos ou, no mínimo, um estado claro de ausência de materiais. Isto prepara o BK-MF0-11, onde os resumos devem ser baseados nos materiais enviados.

Este BK deve evitar promessas de IA que ainda não existem. Se não houver provider de IA configurado, o perfil fica `READY_FOR_GENERATION` ou `MISSING_MATERIALS`, mas não inventa respostas.

## Porque é que isto é importante

- Cria a ponte entre materiais e geração de conteúdos.
- Define limites para a IA antes de a usar.
- Reutiliza a voz/tom do BK-MF0-09 quando existir.
- Prepara citações e isolamento por área para fases futuras.
- Evita que cada endpoint de IA construa contexto de forma diferente.

## O que entra (scope)

- Estado esperado antes do BK: área e materiais submetidos.
- Estado esperado depois do BK: área tem `AiAreaProfile` reutilizável.
- Ficheiros a criar/editar:
  - `apps/api/src/modules/ai/schemas/ai-area-profile.schema.ts`
  - `apps/api/src/modules/ai/ai-area-profile.controller.ts`
  - `apps/api/src/modules/ai/ai-area-profile.service.ts`
  - `apps/api/src/modules/ai/dto/ai-area-profile.dto.ts`
  - `apps/web/src/components/ai/AiAreaProfilePanel.tsx`
  - `apps/web/src/pages/student/StudyAreaDetailPage.tsx`
- Ficheiros a rever: BK-MF0-08, BK-MF0-09, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `BK-MF0-08`; opcionalmente consome `BK-MF0-09`.
- Impacto na arquitetura: cria domínio `ai` sem acoplar diretamente aos controllers de materiais.
- Impacto em frontend: painel de estado do perfil IA da área.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:id/ai-profile`.
- Impacto em dados: cria `AiAreaProfile`.
- Impacto em segurança: contexto só inclui materiais da área do aluno.
- Impacto em testes: validar área alheia, área sem materiais e perfil duplicado.
- Handoff: BK-MF0-11 usa este perfil para criar resumo.

## O que não entra (scope-out)

- Chamada real a IA para gerar resumo.
- Vetores/embeddings e indexação completa.
- Conhecimento externo.
- Guardrails avançados por grupo/turma.
- Configuração de modelos e quotas.

## Como saber que isto ficou bem

- Área válida gera perfil IA.
- Perfil inclui referências a materiais da área, não de outras áreas.
- Perfil reutiliza tom/estilo quando existir.
- Área sem materiais tem estado controlado.
- Criar perfil repetido não duplica dados indevidamente.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Daniel` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-08` (CANONICO)
- Pre-condicoes: área com materiais submetidos ou estado sem materiais tratado (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-AI-AREA-PROFILE`
- Fonte de verdade: `docs/RF.md`, `RF10` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-10` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Perfil IA privado da Área de Estudo (CANONICO)
- `rf_rnf`: `RF10` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `AiAreaProfile`.
- Criar service de construção do perfil.
- Ler materiais da área.
- Ler preferências de voz/tom quando existirem.
- Criar endpoint protegido.
- Criar painel de estado no frontend.
- Preparar contrato para resumos.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF09, RF10, RF11, RF35, RF38.
- `docs/RNF.md`: RNF19, RNF20, RNF31, RNF35.
- BK-MF0-07: áreas.
- BK-MF0-08: materiais.
- BK-MF0-09: voz/tom, se implementado.

## Glossário (rápido) (DERIVADO):

- **Perfil IA**: configuração e contexto que a IA usará numa área.
- **Contexto**: materiais e preferências disponíveis para responder.
- **Fonte**: material usado como base factual.
- **Estado do perfil**: pronto, sem materiais, erro ou pendente.
- **Guardrail**: regra que limita respostas da IA.
- **Alucinação**: resposta factual inventada pela IA.
- **Provider IA**: serviço externo/interno que gera texto, ainda fora deste BK.

## Conceitos teóricos essenciais (DERIVADO):

**Preparar contexto antes de gerar.** Uma IA só deve responder com base em dados autorizados. O perfil IA ajuda a centralizar os materiais e limites que serão usados por resumos e quizzes.

**Separação entre configuração e execução.** Criar perfil IA não significa chamar um modelo. Esta separação facilita testes sem custos externos e evita depender de API externa para validar o BK.

**Isolamento por área.** O perfil só pode incluir materiais cujo `studyAreaId` pertence ao aluno. Misturar áreas pode gerar respostas erradas e violar privacidade.

**Estados explícitos.** Se faltarem materiais, o perfil deve dizer isso. Estados claros evitam UI confusa e ajudam o próximo BK a decidir se pode gerar resumo.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): confirmar que este BK não gera IA**
   - Descrição detalhada do objetivo: separar perfil de geração.
   - Justificação: RF10 prepara, RF11 gera resumo.
   - Como fazer (0.1): rever RF10 e RF11.
   - Como fazer (0.2): documentar que provider IA fica fora.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: descrição do PR.
   - Snippet de referência: `AiAreaProfile.status`.
   - O que verificar: nenhum endpoint chama OpenAI neste BK.

1. **Objetivo (~35 min): criar modelo AiAreaProfile**
   - Descrição detalhada do objetivo: persistir perfil por área.
   - Justificação: BK-MF0-11 precisa de perfil estável.
   - Como fazer (1.1): criar referência única por `studyAreaId`.
   - Como fazer (1.2): guardar estado, materiais incluídos e preferências.
   - Ficheiro a rever: `apps/api/src/modules/study-areas/schemas/study-area.schema.ts`.
   - Ficheiro alvo: `apps/api/src/modules/ai/schemas/ai-area-profile.schema.ts`.
   - Snippet de referência:
     ```ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     import { HydratedDocument, Types } from 'mongoose';

     export type AiAreaProfileDocument = HydratedDocument<AiAreaProfile>;

     @Schema({ timestamps: true, collection: 'ai_area_profiles' })
     export class AiAreaProfile {
       @Prop({ type: Types.ObjectId, ref: 'StudyArea', required: true, unique: true, index: true })
       studyAreaId!: Types.ObjectId;

       @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
       userId!: Types.ObjectId;

       @Prop({ required: true, enum: ['MISSING_MATERIALS', 'READY_FOR_GENERATION'] })
       status!: string;

       @Prop({ default: 0, min: 0 })
       sourceCount!: number;

       @Prop({ type: [{ type: Types.ObjectId, ref: 'Material' }], default: [] })
       materialIds!: Types.ObjectId[];
     }

     export const AiAreaProfileSchema = SchemaFactory.createForClass(AiAreaProfile);
     ```
   - O que verificar: não há mais de um perfil ativo por área.

2. **Objetivo (~40 min): construir perfil a partir da área**
   - Descrição detalhada do objetivo: ler área, materiais e voz.
   - Justificação: contexto deve ser consistente.
   - Como fazer (2.1): validar ownership da área.
   - Como fazer (2.2): contar materiais em estado permitido.
   - Ficheiro a rever: BK-MF0-08.
   - Ficheiro alvo: `apps/api/src/modules/ai/ai-area-profile.service.ts`.
   - Snippet de referência:
     ```ts
     const materials = await materialsService.listByArea(userId, studyAreaId);
     const status = materials.length === 0 ? "MISSING_MATERIALS" : "READY_FOR_GENERATION";
     ```
   - O que verificar: materiais de outras áreas não entram.

3. **Objetivo (~30 min): definir contrato do perfil**
   - Descrição detalhada do objetivo: criar DTO de resposta.
   - Justificação: frontend e BK-MF0-11 precisam do mesmo formato.
   - Como fazer (3.1): incluir `status`, `sourceCount`, `voiceTone`, `updatedAt`.
   - Como fazer (3.2): não incluir conteúdo sensível ou paths internos.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/dto/ai-area-profile.dto.ts`.
   - Snippet de referência:
     ```ts
     export type AiAreaProfileDto = {
       status: "READY_FOR_GENERATION" | "MISSING_MATERIALS";
       sourceCount: number;
       voiceTone?: string;
     };
     ```
   - O que verificar: resposta não inclui ficheiros brutos.

4. **Objetivo (~30 min): expor endpoint protegido**
   - Descrição detalhada do objetivo: criar ou atualizar perfil IA.
   - Justificação: aluno precisa preparar a área para IA.
   - Como fazer (4.1): criar `POST /api/study-areas/:id/ai-profile`.
   - Como fazer (4.2): tornar operação idempotente.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/ai-area-profile.controller.ts`.
   - Snippet de referência:
     ```ts
     // 200/201: AiAreaProfileDto
     ```
   - O que verificar: chamada repetida não cria duplicados.

5. **Objetivo (~40 min): criar painel de perfil IA**
   - Descrição detalhada do objetivo: mostrar se a área está pronta para resumos.
   - Justificação: feedback imediato reduz confusão.
   - Como fazer (5.1): criar `AiAreaProfilePanel`.
   - Como fazer (5.2): mostrar `Adicionar materiais` quando `MISSING_MATERIALS`.
   - Ficheiro a rever: BK-MF0-07.
   - Ficheiro alvo: `apps/web/src/components/ai/AiAreaProfilePanel.tsx`.
   - Snippet de referência:
     ```tsx
     {profile.status === "MISSING_MATERIALS" && <p>Adiciona materiais para ativar resumos.</p>}
     ```
   - O que verificar: UI não mostra resumo falso.

6. **Objetivo (~35 min): registar histórico e observabilidade mínima**
   - Descrição detalhada do objetivo: criar evento quando perfil é preparado.
   - Justificação: ajuda o aluno a ver progresso e facilita defesa.
   - Como fazer (6.1): registar `AI_PROFILE_CREATED`.
   - Como fazer (6.2): adicionar log estruturado sem dados sensíveis.
   - Ficheiro a rever: BK-MF0-06.
   - Ficheiro alvo: `apps/api/src/modules/ai/ai-area-profile.service.ts`.
   - Snippet de referência: `logger.info({ event: "AI_PROFILE_CREATED", studyAreaId })`.
   - O que verificar: logs não incluem conteúdo dos materiais.

7. **Objetivo (~40 min): testar negativos e prontidão**
   - Descrição detalhada do objetivo: validar perfil pronto, sem materiais e área alheia.
   - Justificação: P0 exige 3 negativos.
   - Como fazer (7.1): testar área com materiais.
   - Como fazer (7.2): testar área sem materiais, área alheia e perfil duplicado.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/ai/ai-area-profile.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(profile.sourceCount).toBeGreaterThan(0);
     ```
   - O que verificar: perfil duplicado é atualizado, não duplicado.

8. **Objetivo (~20 min): preparar handoff para resumos**
   - Descrição detalhada do objetivo: deixar contrato claro para BK-MF0-11.
   - Justificação: resumo precisa de perfil e materiais.
   - Como fazer (8.1): documentar estados aceites para gerar resumo.
   - Como fazer (8.2): anexar resposta JSON do perfil.
   - Ficheiro a rever: `MF-VIEWS.md`.
   - Ficheiro alvo: evidence do PR.
   - Snippet de referência: `status: "READY_FOR_GENERATION"`.
   - O que verificar: BK-MF0-11 sabe quando bloquear geração.

## Checklist de validação (DERIVADO):

- Smoke:
  - Criar perfil para área com materiais.
  - Ver painel com estado pronto.
- Negativos:
  - passo 7; input/ação: área sem materiais; resultado esperado: estado `MISSING_MATERIALS`; risco que cobre: IA sem fontes.
  - passo 7; input/ação: área de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
  - passo 7; input/ação: criar perfil duas vezes; resultado esperado: sem duplicação; risco que cobre: inconsistência de contexto.
- Técnico:
  - Um perfil por área.
  - Perfil não chama provider IA.
- Regressão das fases anteriores:
  - Materiais continuam listáveis.
- UI/mockup:
  - Sem mockup específico; painel simples e extensível.
- Segurança:
  - Perfil só inclui fontes da área do aluno.

## Critérios de aceite:

- Outputs:
  - Schema Mongoose `AiAreaProfile`.
  - Endpoint de criação/atualização.
  - Painel de estado no frontend.
- Verificações:
  - Área com materiais fica `READY_FOR_GENERATION`.
  - Área sem materiais fica `MISSING_MATERIALS`.
- Qualidade:
  - Perfil separado de geração real.
  - Sem dados sensíveis na resposta.
- Continuidade:
  - BK-MF0-11 usa o perfil para resumos.
- Evidência:
  - PR inclui JSON do perfil e 3 negativos.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/ai/*profile*`, `apps/web/src/components/ai/AiAreaProfilePanel.tsx`
- `commands`: `npm test`, `npm run test:e2e`, `npm run lint`
- `screenshots`: `A preencher com painel de perfil IA`
- `notes`: `Sem chamada real a IA neste BK`

## TODOs

- TODO: confirmar estados finais do perfil IA.
- TODO: decidir se materiais `PENDING_PROCESSING` podem contar como fontes.
- FOLLOW-UP: BK-MF0-11 deve bloquear geração quando `MISSING_MATERIALS`.
- Assunção a validar com o orientador: perfil IA pode ser criado antes de indexação completa, mas deve sinalizar estado.
- Decisão dependente de mockup: painel IA ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para perfil IA por área, sem geração real e com contratos para resumos.
- `2026-05-25`: perfil IA atualizado para MongoDB/Mongoose com `studyAreaId` único.
