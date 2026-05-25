# BK-MF0-08 - Submeter materiais (PDF, DOCX, URLs, tópicos).

## Header
- `doc_id`: `GUIA-BK-MF0-08`
- `bk_id`: `BK-MF0-08`
- `macro`: `MF0`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-07`
- `rf_rnf`: `RF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-09`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md`
- `last_updated`: `2026-05-25`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno submeta materiais numa Área de Estudo: ficheiros PDF, DOCX, URLs e tópicos escritos manualmente. O objetivo é criar a base factual que depois alimenta o perfil de IA, resumos e quizzes.

Este BK não implementa indexação automática completa. RF31 e RNF11 tratam indexação posterior e assíncrona. Aqui o foco é submissão segura, validação, armazenamento do registo e estado inicial do material, por exemplo `PENDING_PROCESSING`.

Como uploads e URLs são superfícies de risco, este BK deve ser conservador: validar tipo, tamanho, URL e ownership da área. O mockup não mostra uploads, por isso a UI deve ter placeholders claros e estados de progresso sem simular IA.

## Porque é que isto é importante

- Desbloqueia BK-MF0-10, BK-MF0-11 e BK-MF0-12.
- Cria contrato de materiais reutilizável por aluno e, no futuro, por professor/turma.
- Ensina validação de uploads e URLs no backend.
- Prepara processamento assíncrono sem bloquear a UI.
- Reduz risco de ficheiros perigosos, URLs inválidos e acesso a áreas alheias.

## O que entra (scope)

- Estado esperado antes do BK: área de estudo criada no BK-MF0-07.
- Estado esperado depois do BK: aluno submete material válido e vê o estado do material na área.
- Ficheiros a criar/editar:
  - `apps/api/src/modules/materials/schemas/material.schema.ts`
  - `apps/api/src/modules/materials/materials.controller.ts`
  - `apps/api/src/modules/materials/materials.service.ts`
  - `apps/api/src/modules/materials/dto/create-material.dto.ts`
  - `apps/api/src/modules/materials/validators/material-upload.validator.ts`
  - `apps/web/src/pages/student/StudyAreaMaterialsPage.tsx`
  - `apps/web/src/components/materials/MaterialSubmitForm.tsx`
  - `apps/web/src/components/materials/MaterialList.tsx`
- Ficheiros a rever: BK-MF0-07, BK-MF0-06, `docs/RF.md`, `docs/RNF.md`.
- Dependências de BK anteriores: `studyAreaId` válido do BK-MF0-07.
- Impacto na arquitetura: cria domínio `materials`.
- Impacto em frontend: formulário com tabs ou selector para ficheiro, URL e tópico.
- Impacto em backend: endpoint derivado `POST /api/study-areas/:studyAreaId/materials`.
- Impacto em dados: cria `Material` com tipo, estado e dono.
- Impacto em segurança: valida MIME/tamanho/URL e ownership.
- Impacto em testes: negativos de formato, tamanho e área alheia.
- Handoff: BK-MF0-10 deve usar materiais da área para criar perfil IA.

## O que não entra (scope-out)

- Extração/indexação completa de texto, que pertence a RF31/RF32.
- Resumos, explicações, cards e quizzes.
- Integração com Google Drive/OneDrive.
- Processamento sandbox avançado, que pertence aos RNF de segurança.
- Partilha de materiais com turmas/grupos.

## Como saber que isto ficou bem

- PDF/DOCX válido cria registo `Material`.
- URL válida cria registo `Material` sem fazer scraping avançado.
- Tópico manual cria registo textual.
- Ficheiro inválido, demasiado grande ou área alheia são rejeitados.
- UI mostra estado `Pendente de processamento` ou equivalente.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Kaua` (CANONICO)
- Apoio: `Guilherme` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-07` (CANONICO)
- Pre-condicoes: área de estudo válida e pertencente ao aluno (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Reforco` (CANONICO)
- Flow ID: `FLOW-MF0-MATERIAL-SUBMISSION`
- Fonte de verdade: `docs/RF.md`, `RF08` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-08` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Submissão segura de materiais por área de estudo (CANONICO)
- `rf_rnf`: `RF08` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `Material`.
- Criar DTO para URL/tópico e contrato para upload.
- Criar validação de MIME, tamanho e URL.
- Criar endpoint protegido por área.
- Criar UI de submissão e listagem.
- Registar evento `MATERIAL_SUBMITTED` no histórico quando disponível.
- Preparar estado para indexação futura.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF08, RF31, RF34.
- `docs/RNF.md`: RNF03, RNF11, RNF18, RNF20, RNF39.
- BK-MF0-07: áreas de estudo.
- BK-MF0-06: histórico.
- `PLANO-SPRINTS.md`: negativos P0.

## Glossário (rápido) (DERIVADO):

- **Material**: fonte de estudo enviada pelo aluno.
- **MIME type**: tipo técnico do ficheiro, por exemplo `application/pdf`.
- **Upload multipart**: envio de ficheiro por formulário HTTP.
- **URL**: endereço externo indicado pelo aluno.
- **Tópico manual**: texto curto que representa matéria sem ficheiro.
- **Estado de processamento**: fase do material, por exemplo pendente ou pronto.
- **Sandbox**: ambiente isolado para processar ficheiros, reforçado em BK futuro.
- **Indexação**: preparação do conteúdo para pesquisa/IA, fora deste BK.

## Conceitos teóricos essenciais (DERIVADO):

**Upload seguro.** Nunca se deve confiar apenas no nome do ficheiro. O backend valida MIME, extensão, tamanho e ownership. Ficheiros perigosos devem ser rejeitados antes de qualquer processamento.

**Estado assíncrono.** O upload cria o material, mas a indexação pode demorar. Por isso, o material deve ter estados como `PENDING_PROCESSING`, `READY` e `FAILED`. Este BK cria o estado inicial.

**URL como material.** Uma URL não deve ser automaticamente confiável. Nesta fase, guardar a URL validada é suficiente. Scraping, extração e sandbox ficam para BKs de indexação.

**Separação por área.** Todo material pertence a uma `StudyArea`. Isso permite que a IA futura responda com base no contexto certo.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): confirmar limites e tipos permitidos**
   - Descrição detalhada do objetivo: definir tipos aceites sem inventar formatos extra.
   - Justificação: RF08 menciona PDF, DOCX, URLs e tópicos.
   - Como fazer (0.1): listar tipos `PDF`, `DOCX`, `URL`, `TOPIC`.
   - Como fazer (0.2): definir limite inicial de tamanho como assunção técnica.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/materials/validators/material-upload.validator.ts`.
   - Snippet de referência: `allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]`.
   - O que verificar: não aceitar imagens, executáveis ou ZIP neste BK.

1. **Objetivo (~35 min): criar modelo Material**
   - Descrição detalhada do objetivo: guardar metadados do material.
   - Justificação: IA futura precisa de saber origem, tipo e estado.
   - Como fazer (1.1): criar campos `studyAreaId`, `userId`, `type`, `title`, `status`.
   - Como fazer (1.2): incluir campos opcionais `url`, `storageKey`, `mimeType`, `sizeBytes`, `contentText`.
   - Ficheiro a rever: `apps/api/src/modules/study-areas/schemas/study-area.schema.ts`.
   - Ficheiro alvo: `apps/api/src/modules/materials/schemas/material.schema.ts`.
   - Snippet de referência:
     ```ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     import { HydratedDocument, Types } from 'mongoose';

     export type MaterialDocument = HydratedDocument<Material>;

     @Schema({ timestamps: true, collection: 'materials' })
     export class Material {
       @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
       userId!: Types.ObjectId;

       @Prop({ type: Types.ObjectId, ref: 'StudyArea', required: true, index: true })
       studyAreaId!: Types.ObjectId;

       @Prop({ required: true, enum: ['PDF', 'DOCX', 'URL', 'TOPIC'] })
       type!: string;

       @Prop({ required: true, trim: true })
       title!: string;

       @Prop({ required: true, enum: ['PENDING_PROCESSING', 'READY', 'FAILED'], default: 'PENDING_PROCESSING' })
       status!: string;

       @Prop()
       contentText?: string;
     }

     export const MaterialSchema = SchemaFactory.createForClass(Material);
     ```
   - O que verificar: material está ligado à área e ao aluno.

2. **Objetivo (~35 min): validar área e ownership**
   - Descrição detalhada do objetivo: garantir que o aluno só adiciona materiais às suas áreas.
   - Justificação: evita IDOR.
   - Como fazer (2.1): reutilizar `getMyStudyArea(userId, studyAreaId)`.
   - Como fazer (2.2): se não existir, devolver `404` ou `403`.
   - Ficheiro a rever: `apps/api/src/modules/study-areas/study-areas.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/materials/materials.service.ts`.
   - Snippet de referência:
     ```ts
     const area = await studyAreasService.getMyStudyArea(userId, studyAreaId);
     if (!area) throw new Error("STUDY_AREA_NOT_FOUND");
     ```
   - O que verificar: área de outro aluno não recebe material.

3. **Objetivo (~40 min): criar submissão de ficheiro**
   - Descrição detalhada do objetivo: aceitar PDF/DOCX com validação.
   - Justificação: uploads são risco de segurança.
   - Como fazer (3.1): validar MIME e tamanho antes de guardar.
   - Como fazer (3.2): guardar ficheiro em storage local/dev ou storage definido no scaffold.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/api/src/modules/materials/validators/material-upload.validator.ts`.
   - Snippet de referência:
     ```ts
     if (!allowedMimeTypes.includes(file.mimetype)) throw new Error("UNSUPPORTED_FILE_TYPE");
     ```
   - O que verificar: `.exe` renomeado para `.pdf` é rejeitado se MIME não bater certo.

4. **Objetivo (~35 min): criar submissão de URL e tópico**
   - Descrição detalhada do objetivo: aceitar materiais sem ficheiro.
   - Justificação: RF08 inclui URLs e tópicos.
   - Como fazer (4.1): validar URL com protocolo `http` ou `https`.
   - Como fazer (4.2): validar tópico com texto mínimo e máximo.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/materials/dto/create-material.dto.ts`.
   - Snippet de referência:
     ```ts
     export type CreateMaterialDto = { type: "URL" | "TOPIC"; title: string; url?: string; topicText?: string };
     ```
   - O que verificar: `javascript:` e URLs inválidas são rejeitadas.

5. **Objetivo (~35 min): expor endpoints**
   - Descrição detalhada do objetivo: criar API para criar e listar materiais.
   - Justificação: frontend e IA futura precisam do contrato.
   - Como fazer (5.1): criar `POST /api/study-areas/:studyAreaId/materials`.
   - Como fazer (5.2): criar `GET /api/study-areas/:studyAreaId/materials`.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/materials/materials.controller.ts`.
   - Snippet de referência:
     ```ts
     // 201: { id, type, title, status: "PENDING_PROCESSING" }
     ```
   - O que verificar: resposta não expõe caminho absoluto do servidor.

6. **Objetivo (~45 min): criar UI de submissão**
   - Descrição detalhada do objetivo: permitir ficheiro, URL ou tópico.
   - Justificação: o aluno deve conseguir alimentar a área de estudo.
   - Como fazer (6.1): criar `MaterialSubmitForm`.
   - Como fazer (6.2): mostrar progresso/feedback e lista de materiais.
   - Ficheiro a rever: BK-MF0-07.
   - Ficheiro alvo: `apps/web/src/components/materials/MaterialSubmitForm.tsx`.
   - Snippet de referência:
     ```tsx
     <input type="file" accept=".pdf,.docx" />
     ```
   - O que verificar: UI mostra erro antes/depois da submissão inválida.

7. **Objetivo (~35 min): integrar histórico e estado**
   - Descrição detalhada do objetivo: registar evento e mostrar estado pendente.
   - Justificação: prepara BK-MF0-06 e BKs de IA.
   - Como fazer (7.1): após criação, gravar `MATERIAL_SUBMITTED`.
   - Como fazer (7.2): mostrar `Pendente de processamento`.
   - Ficheiro a rever: `apps/api/src/modules/study/history.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/materials/materials.service.ts`.
   - Snippet de referência: `status: "PENDING_PROCESSING"`.
   - O que verificar: falha de histórico não duplica material.

8. **Objetivo (~45 min): testar negativos e handoff para IA**
   - Descrição detalhada do objetivo: validar segurança e preparar próximo BK.
   - Justificação: materiais são base da IA e superfície crítica.
   - Como fazer (8.1): testar ficheiro inválido, tamanho excedido e área alheia.
   - Como fazer (8.2): guardar material de teste para BK-MF0-10.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/materials/materials.e2e-spec.ts`.
   - Snippet de referência:
     ```ts
     expect(response.body.status).toBe("PENDING_PROCESSING");
     ```
   - O que verificar: próximos BKs têm `materialId` válido.

## Checklist de validação (DERIVADO):

- Smoke:
  - Submeter PDF válido.
  - Submeter URL válida.
  - Submeter tópico manual.
- Negativos:
  - passo 8; input/ação: ficheiro `.exe`; resultado esperado: `400`; risco que cobre: upload perigoso.
  - passo 8; input/ação: ficheiro acima do limite; resultado esperado: `413` ou `400`; risco que cobre: abuso de armazenamento.
  - passo 8; input/ação: `studyAreaId` de outro aluno; resultado esperado: `404` ou `403`; risco que cobre: IDOR.
- Técnico:
  - Estado inicial é `PENDING_PROCESSING`.
  - Paths absolutos de storage não são expostos.
- Regressão das fases anteriores:
  - Área de estudo continua privada.
  - Histórico recebe evento quando disponível.
- UI/mockup:
  - Sem mockup específico; formulário deve ser claro e acessível.
- Segurança:
  - Validação no backend, não apenas no frontend.

## Critérios de aceite:

- Outputs:
  - Schema Mongoose `Material`.
  - Endpoints de submissão/listagem.
  - UI de submissão.
- Verificações:
  - PDF/DOCX válido responde `201`.
  - URL inválida responde `400`.
  - Área alheia falha.
- Qualidade:
  - Upload, URL e tópico têm validações separadas.
  - Estado prepara indexação futura.
- Continuidade:
  - BK-MF0-10 usa materiais da área.
  - BK-MF0-11 só resume materiais existentes.
- Evidência:
  - PR inclui smoke, 3 negativos e screenshot da área com material.

## Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `apps/api/src/modules/materials/*`, `apps/web/src/components/materials/*`
- `commands`: `npm test`, `npm run test:e2e`, `npm run lint`
- `screenshots`: `A preencher com formulário/lista de materiais`
- `notes`: `Indexação real fica fora deste BK`

## TODOs

- TODO: definir limite máximo oficial de upload para MVP.
- TODO: escolher storage local/dev ou storage externo quando houver infraestrutura.
- TODO (BLOCKER): processamento seguro/sandbox completo depende de RNF18 em fase posterior.
- FOLLOW-UP: BK-MF0-10 deve usar materiais com estado adequado.
- Assunção a validar com o orientador: guardar URL sem scraping avançado é suficiente nesta fase.
- Decisão dependente de mockup: ecrã de materiais ainda não existe.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para submissão segura de materiais, com validação, ownership e handoff para IA.
- `2026-05-25`: material atualizado para coleção MongoDB/Mongoose e referências `ObjectId`.
