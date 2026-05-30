# AUDITORIA-HIDRATACAO-MF1

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `status`: `corrigido`
- `last_updated`: `2026-05-30`
- `modo`: `corrigir_apenas`
- `auditoria`: revisão documental, pedagógica, técnica, correção e validação dos guias BK da MF1

## Objetivo
Corrigir os guias BK da `MF1`, partindo da auditoria existente, para que os 10 BKs fiquem executáveis por ordem, com contratos técnicos coerentes, explicações pós-código completas e validações esperadas explícitas.

O código existente em `apps/` não foi usado como contrato técnico final e não foi alterado. A fonte de verdade desta correção foi composta pela documentação canónica, pelos BKs da `MF0`, pelos BKs da `MF1` e pelos BKs posteriores que declaram dependência da `MF1`.

## Fontes consultadas
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF0/*.md`
- `docs/planificacao/guias-bk/MF1/*.md`
- BKs posteriores com dependência declarada da `MF1`: `BK-MF2-01`, `BK-MF2-02`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-12`, `BK-MF3-04`, `BK-MF3-05`, `BK-MF4-01`.

## Resumo executivo
Foram corrigidos os 10 guias BK da `MF1`.

Contagem antes da correção:
- `OK`: 0
- `PARCIAL`: 7
- `CRÍTICO`: 3

Contagem depois da correção:
- `OK`: 10
- `PARCIAL`: 0
- `CRÍTICO`: 0

BKs editados nesta execução:
- `BK-MF1-01`
- `BK-MF1-02`
- `BK-MF1-03`
- `BK-MF1-04`
- `BK-MF1-07`
- `BK-MF1-08`
- `BK-MF1-09`
- `BK-MF1-10`
- `BK-MF1-11`
- `BK-MF1-12`

Resultado principal:
- A cadeia crítica `BK-MF1-02` -> `BK-MF1-03` -> `BK-MF1-04` deixou de importar disciplinas oficiais antes de `BK-MF1-08`.
- `BK-MF1-02` passou a usar `disciplineName?: string` como decisão `DERIVADO` para salas por disciplina.
- `BK-MF1-03` passou a validar `MATERIAL_REF` contra materiais do próprio aluno criados na `MF0`.
- `BK-MF1-04` mantém a dependência canónica no header, mas declara no corpo a dependência técnica `DERIVADO` de `BK-MF1-03`.
- Os BKs com IA (`BK-MF1-01`, `BK-MF1-04`, `BK-MF1-11`) validam em runtime `answer` não vazio e fontes autorizadas antes de persistir.
- `BK-MF1-09` removeu o campo livre de notas do contrato DTO/frontend.
- Todos os BKs têm `Expected results` antes dos critérios de aceite.
- Foram removidas explicações pós-código genéricas e comentários didáticos genéricos.

## Critério aplicado
Um BK foi considerado `OK` quando cumpre simultaneamente estrutura pedagógica, 8 passos com pontos 1 a 7, explicação pós-código concreta, código completo, integração com BKs anteriores, preparação para BKs seguintes, ausência de linguagem interna e execução sequencial sem imports futuros.

Nesta correção, os drifts documentais canónicos não foram alterados sem evidência. Ficaram registados como blockers documentais, mas já não impedem a execução técnica dos guias.

## Classificação por BK
| BK | Estado | Motivo curto |
| --- | --- | --- |
| `BK-MF1-01` | `OK` | Perfil adaptativo, fontes `READY`, validação de IA e expected results reforçados. |
| `BK-MF1-02` | `OK` | Removida dependência futura de disciplinas oficiais; salas `SUBJECT` usam `disciplineName` como decisão `DERIVADO`. |
| `BK-MF1-03` | `OK` | `MATERIAL_REF` valida material próprio da MF0 e `StudyRoomsModule` já não importa disciplinas oficiais. |
| `BK-MF1-04` | `OK` | Dependência técnica de `BK-MF1-03` declarada no corpo, módulo sem disciplinas oficiais e resposta IA validada antes de gravar. |
| `BK-MF1-07` | `OK` | Expected results e explicações reforçam turma oficial, sessão, inscrição e membership. |
| `BK-MF1-08` | `OK` | Expected results reforçam disciplina oficial, ownership do professor e exports para BKs seguintes. |
| `BK-MF1-09` | `OK` | Materiais oficiais alinhados; campo livre de notas removido do contrato e expected results adicionados. |
| `BK-MF1-10` | `OK` | Voz docente textual reforçada com expected results e contrato `PUT` idempotente. |
| `BK-MF1-11` | `OK` | IA limitada valida inscrição, fontes oficiais processadas, voz docente e runtime do provider. |
| `BK-MF1-12` | `OK` | Publicações separam escrita docente e leitura por aluno inscrito, com expected results explícitos. |

## Detalhe pós-correção por BK
### `BK-MF1-01` - `OK`
- Reforçada a IA adaptativa com validação runtime do provider.
- A explicação só é persistida se `answer` for não vazio e `sourceMaterialIds` pertencerem aos materiais `READY` autorizados da área do aluno.
- `Expected results` cobre `200`, `404`, `422` e `503`.

### `BK-MF1-02` - `OK`
- Removidos `subjectId`, `Subject`, `SubjectSchema` e imports de disciplinas oficiais.
- Salas `SUBJECT` usam `disciplineName?: string` como decisão `DERIVADO`.
- `StudyRoomsService.ensureMember` continua a ser o contrato exportado para `BK-MF1-03` e `BK-MF1-04`.

### `BK-MF1-03` - `OK`
- `RoomShare` valida membership antes de criar/listar partilhas.
- `MATERIAL_REF` consulta materiais da MF0 por `_id` e `userId` do aluno autenticado.
- Texto copiado pelo frontend não é aceite como prova de ownership.

### `BK-MF1-04` - `OK`
- Header canónico preservado com dependência `BK-MF1-02`.
- Corpo declara dependência técnica `DERIVADO` de `BK-MF1-03`.
- IA da sala valida fontes `RoomShare.usableByAi`, `answer` não vazio e `sourceShareIds` autorizados.

### `BK-MF1-07` - `OK`
- Expected results documentam criação de turma, duplicados, inscrição por email e leitura do aluno inscrito.
- Explicações pós-código reforçam sessão autenticada, ownership docente e membership.

### `BK-MF1-08` - `OK`
- Expected results documentam disciplina oficial dentro de turma, `403`, `404` e `409`.
- Handoff para materiais oficiais, voz docente e IA limitada ficou explícito.

### `BK-MF1-09` - `OK`
- Campo livre de notas removido do DTO/frontend.
- Expected results distinguem material `TEXT` processado de `URL` de referência.
- Drift documental de owner permanece registado como blocker documental, sem alterar o header.

### `BK-MF1-10` - `OK`
- Expected results reforçam `PUT` idempotente, normalização de regras e ownership da disciplina.
- Voz docente continua textual e não funciona como fonte factual.

### `BK-MF1-11` - `OK`
- IA limitada valida inscrição via disciplina/turma, materiais oficiais `PROCESSED` e voz docente.
- Resultado do provider é validado antes de persistir, com `503` para resposta vazia ou fontes inválidas.

### `BK-MF1-12` - `OK`
- Expected results cobrem escrita docente, leitura por aluno inscrito e bloqueios `403/404`.
- Publicações ficam separadas de notificações avançadas de BKs posteriores.

## Histórico da auditoria antes da correção
Esta secção preserva o ponto de partida usado para a correção. As classificações e problemas abaixo são históricos e não representam o estado atual depois desta execução.

### `BK-MF1-01` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- Problema principal: o guia tem código completo para perfil e explicação adaptativa, mas a explicação depois dos blocos de código é repetidamente genérica.
- Exemplos concretos: em vários passos surge apenas "Confirma que a peça criada neste passo está ligada ao fluxo principal do BK", sem explicar parâmetros, retorno, validações, ownership, erros ou ligação concreta com `Material`, `StudyArea` e `AI_PROVIDER`.
- O que falta completar: explicar `LearningProfile`, `AdaptiveExplanation`, `generateAdaptiveExplanation`, `status: READY`, `contentText`, erros `422/503` e validação de resposta da IA.
- Risco pedagógico: o aluno copia código sem perceber porque a IA só pode usar fontes processáveis da área do próprio aluno.
- Risco técnico: a resposta do provider é guardada sem validação forte do formato para além do tipo TypeScript esperado.
- Dependências a reler: `BK-MF0-08`, `BK-MF0-10`, `BK-MF0-11`, `BK-MF0-12`, `RF13`, `RNF19`, `RNF20`, `RNF31`, `RNF35`.
- Prioridade de correção: alta.

### `BK-MF1-02` - `CRÍTICO`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md`
- Problema principal: o guia importa e regista `Subject`/`SubjectSchema` antes de o domínio de disciplinas existir na sequência da MF1.
- Exemplos concretos: `study-rooms.service.ts` importa `../subjects/schemas/subject.schema`; `study-rooms.module.ts` importa `Subject` e `SubjectSchema`. Esses ficheiros só são criados em `BK-MF1-08`.
- O que falta completar: decidir se a sala por disciplina fica adiada até `BK-MF1-08` ou se `BK-MF1-02` deve criar um contrato mínimo canónico para disciplina sem contrariar `RF20`.
- Risco pedagógico: o aluno segue o BK por ordem e encontra imports para ficheiros que ainda não existem.
- Risco técnico: a aplicação não compila após `BK-MF1-02`.
- Dependências a reler: `RF14`, `RF20`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `BK-MF1-08`.
- Prioridade de correção: máxima.

### `BK-MF1-03` - `CRÍTICO`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`
- Problema principal: o guia depende de `BK-MF1-02` e atualiza `StudyRoomsModule` mantendo import de `Subject` futuro.
- Exemplos concretos: o módulo da sala inclui `Subject` e `SubjectSchema`, apesar de a sequência ainda não ter criado `apps/api/src/modules/subjects/schemas/subject.schema.ts`.
- O que falta completar: corrigir a base de `StudyRoomsModule` e explicar melhor `RoomShare`, `usableByAi`, `sourceIds` e a diferença entre apontamento, URL e referência a material.
- Risco pedagógico: o aluno aprende um padrão em que um BK usa entidades futuras sem contrato explícito.
- Risco técnico: a partilha da sala não é executável se `BK-MF1-02` continuar a depender de disciplinas futuras.
- Dependências a reler: `BK-MF1-02`, `RF15`, `RF16`, `RF14`, `MATRIZ-CANONICA-BK.md`.
- Prioridade de correção: máxima, logo após `BK-MF1-02`.

### `BK-MF1-04` - `CRÍTICO`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- Problema principal: o header declara só `BK-MF1-02`, mas o código usa `RoomSharesService` criado em `BK-MF1-03`; além disso, o módulo da sala mantém o import futuro de disciplinas.
- Exemplos concretos: `RoomAiService` depende de `RoomSharesService`; `StudyRoomsModule` importa `SubjectSchema` antes de `BK-MF1-08`.
- O que falta completar: alinhar dependência técnica de `BK-MF1-03`, corrigir a cadeia do módulo de salas e reforçar validação/explicação do formato devolvido pela IA.
- Risco pedagógico: o aluno não consegue perceber por que a IA da sala depende das partilhas textuais criadas no BK anterior.
- Risco técnico: imports partidos e potencial gravação de resposta vazia se o provider não devolver `answer`.
- Dependências a reler: `BK-MF1-02`, `BK-MF1-03`, `RF16`, `RNF19`, `RNF20`, `RNF35`.
- Prioridade de correção: máxima, depois de `BK-MF1-02` e `BK-MF1-03`.

### `BK-MF1-07` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md`
- Problema principal: o guia resolve a criação de turmas e acrescenta inscrição de alunos como decisão `DERIVADO`, mas ainda não explica todos os efeitos secundários e cenários de segurança com detalhe suficiente.
- Exemplos concretos: os comentários inline são frequentes, mas muitos dizem genericamente que uma validação bloqueia dados inválidos; falta explicar por que `teacherId` e `studentIds` vêm de sessão/BD.
- O que falta completar: aprofundar `SchoolClass`, `studentIds`, `findOwnedClass`, `ensureStudentEnrollment`, conflito de código e cenários `403/404/409`.
- Risco pedagógico: o aluno pode não distinguir turma oficial de sala de estudo colaborativa.
- Risco técnico: a decisão derivada de inscrição por email precisa de justificação mais explícita por ser base de `RF23` e `RF24`.
- Dependências a reler: `RF19`, `RF23`, `RF24`, `BK-MF1-08`, `BK-MF1-11`, `BK-MF1-12`.
- Prioridade de correção: alta.

### `BK-MF1-08` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- Problema principal: cria a disciplina e reutiliza `ClassesService`, mas a explicação pós-código é insuficiente para um aluno compreender ownership e membership.
- Exemplos concretos: `SubjectsService.findSubjectForStudent` aplica inscrição via `ClassesService.ensureStudentEnrollment`, mas o texto não explica suficientemente entrada, saída, exceções e impacto nos BKs seguintes.
- O que falta completar: aprofundar `Subject`, `classId`, `teacherId`, `findOwnedSubject`, `findSubjectForStudent` e a relação com materiais oficiais.
- Risco pedagógico: confusão entre criar disciplina oficial numa turma e criar uma área privada de estudo.
- Risco técnico: uso correto nos BKs seguintes depende de exports e métodos que precisam de handoff mais explícito.
- Dependências a reler: `BK-MF1-07`, `RF20`, `RF21`, `RF23`, `RF28`.
- Prioridade de correção: alta.

### `BK-MF1-09` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`
- Problema principal: estrutura materiais oficiais, mas mantém explicações genéricas e drift de owner entre documentos.
- Exemplos concretos: `CONTRATO-CAMPOS-BK.md` indica owner `Guilherme`, enquanto `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e o guia indicam `Kaua`; o DTO aceita `notes`, mas o schema/service não guardam esse campo.
- O que falta completar: explicar `PROCESSED` vs `REFERENCE_ONLY`, justificar limitação a `TEXT`/`URL`, decidir destino de `notes` e detalhar negativos contra materiais de professor errado.
- Risco pedagógico: o aluno pode pensar que URL já é fonte processável para IA, contrariando o bloqueio por fontes.
- Risco técnico: drift documental e campo DTO não persistido.
- Dependências a reler: `RF21`, `RF31`, `RF34`, `BK-MF1-08`, `BK-MF2-05`, `BK-MF2-07`.
- Prioridade de correção: alta.

### `BK-MF1-10` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md`
- Problema principal: a voz docente está tecnicamente alinhada como estilo pedagógico textual, mas a explicação por bloco ainda não é suficiente.
- Exemplos concretos: o guia acerta no endpoint `PUT`, mas os passos não explicam com detalhe efeitos de `tone`, `detailLevel`, `rules`, normalização de regras e separação entre voz e fonte factual.
- O que falta completar: aprofundar a relação entre `TeacherAiVoice`, `OfficialMaterial`, `ClassAiService`, limites do professor e guardrails de IA.
- Risco pedagógico: o aluno pode confundir "voz" com áudio ou com autorização para inventar conteúdo.
- Risco técnico: validação de payload e defaults precisam de expected results mais concretos.
- Dependências a reler: `RF22`, `RF23`, `RF36`, `RNF33`, `RNF35`, `BK-MF1-09`, `BK-MF1-11`, `BK-MF2-12`.
- Prioridade de correção: média-alta.

### `BK-MF1-11` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- Problema principal: o fluxo usa turma, disciplina, materiais oficiais e voz docente, mas a validação da resposta de IA e a explicação didática ainda estão incompletas.
- Exemplos concretos: o service lê materiais `PROCESSED` e `TeacherAiVoice`, mas guarda `answer` sem validar explicitamente se o provider devolveu JSON válido com `answer`.
- O que falta completar: explicar `ClassAiInteraction`, `findSubjectForStudent`, bloqueio sem fontes, source material ids, `422`, `503` e fallback honesto.
- Risco pedagógico: o aluno pode não perceber a diferença entre IA privada, IA da sala e IA limitada da turma.
- Risco técnico: risco de resposta vazia ou malformada se o provider devolver JSON sem `answer`.
- Dependências a reler: `BK-MF1-07`, `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `RF23`, `RNF19`, `RNF20`, `RNF31`, `RNF35`.
- Prioridade de correção: alta.

### `BK-MF1-12` - `PARCIAL`
- Ficheiro: `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`
- Problema principal: separa escrita por professor e leitura por aluno inscrito, mas a explicação e a validação continuam genéricas.
- Exemplos concretos: o service usa `ClassesService.findOwnedClass` e `ensureStudentEnrollment`, mas os passos não explicam de forma suficiente que avisos/publicações não são notificações push nem tarefas.
- O que falta completar: detalhar `ClassPost`, papéis, leitura por aluno, estados vazios, códigos `403/404` e handoff para notificações.
- Risco pedagógico: o aluno pode confundir publicação com canal avançado de notificação, que pertence a BKs posteriores.
- Risco técnico: dependências posteriores (`BK-MF2-06`, `BK-MF4-01`) precisam de contrato mais explícito sobre posts criados.
- Dependências a reler: `BK-MF1-07`, `RF24`, `RF30`, `RF49`, `BK-MF2-06`, `BK-MF4-01`.
- Prioridade de correção: média-alta.

## Mapa de integração da MF
| BK | Ficheiros criados/editados previstos | Exports produzidos | Imports consumidos de BKs anteriores | Endpoints | DTOs | Schemas/models | Services | Frontend | BKs seguintes dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | `ai/*`, `adaptiveLearning.ts`, `AdaptiveLearningPage.tsx` | `LearningProfile`, `AdaptiveExplanation`, `AdaptiveLearningService`, `generateAdaptiveExplanation` | `Material`, `StudyAreasService`, `AI_PROVIDER` | `GET/PUT /api/study-areas/:studyAreaId/learning-profile`, `POST /api/study-areas/:studyAreaId/adaptive-explanations` | `UpdateLearningProfileDto`, `AskAdaptiveExplanationDto` | `LearningProfile`, `AdaptiveExplanation` | `AdaptiveLearningService` | `adaptiveLearning.ts`, `AdaptiveLearningPage` | `BK-MF3-04` |
| `BK-MF1-02` | `study-rooms/*`, `studyRooms.ts`, `StudyRoomsPage.tsx` | `StudyRoom`, `StudyRoomsService.ensureMember` | `User`; `disciplineName` como decisão `DERIVADO`, sem disciplinas oficiais | `POST /api/study-rooms`, `GET /api/study-rooms`, `POST /api/study-rooms/:roomId/members` | `CreateStudyRoomDto`, `AddRoomMemberDto` | `StudyRoom` | `StudyRoomsService` | `studyRooms.ts`, `StudyRoomsPage` | `BK-MF1-03`, `BK-MF1-04`, `BK-MF3-05` |
| `BK-MF1-03` | `room-share.*`, `roomShares.ts`, `RoomSharesPage.tsx` | `RoomShare`, `RoomSharesService.findUsableSharesForRoom` | `StudyRoomsService.ensureMember`, `Material` da MF0 para `MATERIAL_REF` próprio | `POST/GET /api/study-rooms/:roomId/shares` | `CreateRoomShareDto` | `RoomShare` | `RoomSharesService` | `roomShares.ts`, `RoomSharesPage` | `BK-MF1-04` |
| `BK-MF1-04` | `room-ai.*`, `roomAi.ts`, `RoomAiPage.tsx` | `RoomAiInteraction`, `RoomAiService` | `StudyRoomsService`, `RoomSharesService`, `AI_PROVIDER`; dependência técnica `DERIVADO` de `BK-MF1-03` | `POST /api/study-rooms/:roomId/ai/answers` | `AskRoomAiDto` | `RoomAiInteraction` | `RoomAiService` | `roomAi.ts`, `RoomAiPage` | BKs posteriores de IA colaborativa |
| `BK-MF1-07` | `classes/*`, `classes.ts`, `TeacherClassesPage.tsx`, `StudentClassesPage.tsx` | `SchoolClass`, `ClassesService.findOwnedClass`, `ClassesService.ensureStudentEnrollment` | `User` de `BK-MF0-01` | `POST/GET /api/teacher/classes`, `POST /api/teacher/classes/:classId/students`, `GET /api/student/classes` | `CreateClassDto`, `AddClassStudentDto` | `SchoolClass` | `ClassesService` | `classes.ts`, páginas professor/aluno | `BK-MF1-08`, `BK-MF1-11`, `BK-MF1-12`, `BK-MF2-01`, `BK-MF2-02` |
| `BK-MF1-08` | `subjects/*`, `subjects.ts`, `TeacherSubjectsPage.tsx` | `Subject`, `SubjectsService.findOwnedSubject`, `SubjectsService.findSubjectForStudent` | `ClassesService` | `POST/GET /api/teacher/classes/:classId/subjects` | `CreateSubjectDto` | `Subject` | `SubjectsService` | `subjects.ts`, `TeacherSubjectsPage` | `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-04` |
| `BK-MF1-09` | `official-materials/*`, `officialMaterials.ts`, `TeacherOfficialMaterialsPage.tsx` | `OfficialMaterial`, `OfficialMaterialsService.findProcessedBySubject` | `SubjectsService` | `POST/GET /api/teacher/subjects/:subjectId/materials` | `CreateOfficialMaterialDto` | `OfficialMaterial` | `OfficialMaterialsService` | `officialMaterials.ts`, `TeacherOfficialMaterialsPage` | `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-05`, `BK-MF2-07` |
| `BK-MF1-10` | `teacher-ai/*`, `teacherAiVoice.ts`, `TeacherAiVoicePage.tsx` | `TeacherAiVoice`, `TeacherAiVoiceService.findForSubject` | `SubjectsService` | `PUT/GET /api/teacher/subjects/:subjectId/ai-voice` | `UpdateTeacherAiVoiceDto` | `TeacherAiVoice` | `TeacherAiVoiceService` | `teacherAiVoice.ts`, `TeacherAiVoicePage` | `BK-MF1-11`, `BK-MF2-12` |
| `BK-MF1-11` | `class-ai/*`, `classAi.ts`, `StudentClassAiPage.tsx` | `ClassAiInteraction`, `ClassAiService` | `SubjectsService`, `OfficialMaterialsService`, `TeacherAiVoiceService`, `AI_PROVIDER` | `POST /api/student/subjects/:subjectId/ai/answers` | `AskClassAiDto` | `ClassAiInteraction` | `ClassAiService` | `classAi.ts`, `StudentClassAiPage` | `BK-MF2-12`, BKs de guardrails |
| `BK-MF1-12` | `class-posts/*`, `classPosts.ts`, páginas professor/aluno | `ClassPost`, `ClassPostsService` | `ClassesService` | `POST/GET /api/teacher/classes/:classId/posts`, `GET /api/student/classes/:classId/posts` | `CreateClassPostDto` | `ClassPost` | `ClassPostsService` | `classPosts.ts`, páginas professor/aluno | `BK-MF2-06`, `BK-MF4-01` |

## Coerência global da MF
- Cadeia individual prevista: `StudyArea` + `Material READY` -> `LearningProfile` -> `AdaptiveExplanation`.
- Cadeia colaborativa prevista: `StudyRoom` com `disciplineName` textual opcional -> `RoomShare` -> `RoomAiInteraction`.
- Cadeia docente prevista: `SchoolClass` -> `Subject` -> `OfficialMaterial` -> `TeacherAiVoice` -> `ClassAiInteraction` -> `ClassPost`.
- Problema crítico corrigido: a cadeia colaborativa (`BK-MF1-02` a `BK-MF1-04`) já não referencia disciplinas oficiais antes de `BK-MF1-08`.
- Problema pedagógico transversal corrigido: os BKs mantêm estrutura 1-7 por passo, mas as explicações pós-código genéricas foram substituídas por parágrafos com responsabilidade, entradas, saídas, validações, erros e relação com BKs vizinhos.

## Drift documental encontrado
- `BK-MF1-02`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e o guia indicam `sprint: S02`, mas `CONTRATO-CAMPOS-BK.md` indica `S03`.
- `BK-MF1-09`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e o guia indicam `owner: Kaua`, mas `CONTRATO-CAMPOS-BK.md` indica `Guilherme`.
- `BK-MF1-04`: o header canónico mantém dependência `BK-MF1-02`, mas o guia e o código dependem tecnicamente de `BK-MF1-03`.

## Correções aplicadas
1. `BK-MF1-02`: removida dependência futura de disciplinas oficiais; `disciplineName?: string` adotado como decisão `DERIVADO`.
2. `BK-MF1-03`: módulo da sala atualizado sem disciplinas oficiais; `MATERIAL_REF` validado contra `Material.userId` da MF0.
3. `BK-MF1-04`: dependência técnica de `BK-MF1-03` declarada no corpo; IA valida `answer` e fontes autorizadas antes de guardar.
4. `BK-MF1-01`: perfil adaptativo reforçado com materiais `READY`, validação do provider e `Expected results`.
5. `BK-MF1-07`: expected results e explicações de turma, inscrição, ownership e membership reforçados.
6. `BK-MF1-08`: expected results de disciplina oficial, duplicados, ownership e handoff para BKs seguintes.
7. `BK-MF1-09`: removido campo livre de notas; estados `PROCESSED`/`REFERENCE_ONLY` e ownership docente reforçados.
8. `BK-MF1-10`: voz docente textual reforçada, com `PUT` idempotente e normalização de regras.
9. `BK-MF1-11`: IA limitada valida inscrição, materiais oficiais processados, voz docente e runtime do provider.
10. `BK-MF1-12`: publicações reforçadas com escrita docente, leitura por aluno inscrito e bloqueios por turma.

## Decisões `CANONICO`/`DERIVADO`
- `CANONICO`: headers, owners, sprints, dependências oficiais e ordem dos BKs foram preservados.
- `DERIVADO`: `BK-MF1-02` usa `disciplineName?: string` para representar sala por disciplina antes de `BK-MF1-08`.
- `DERIVADO`: `BK-MF1-04` declara no corpo dependência técnica de `BK-MF1-03`, sem alterar o header canónico.
- `CANONICO`: disciplinas oficiais continuam a nascer apenas em `BK-MF1-08`.
- `CANONICO`: materiais oficiais, voz docente, IA limitada da turma e publicações mantêm a cadeia `BK-MF1-08` -> `BK-MF1-12`.

## Validação obrigatória
Comandos a executar no fim desta execução:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|conversa interna|este guia deixa de ser|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-código|solução parcial|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/MF1/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado:
- Pesquisa textual nos BKs da `MF1`: sem ocorrências. O comando terminou com exit code `1` porque o `rg` não encontrou matches, o que é o resultado esperado.
- `git diff --check`: passou.
- `bash scripts/validate-planificacao.sh`: falhou por bloqueio de infraestrutura do validador.

Validações adicionais executadas:
- Cada BK da `MF1` tem exatamente 8 passos.
- Cada BK da `MF1` mantém 56 pontos numerados `1.` a `7.` no total, ou seja, os 8 passos preservam a estrutura 1-7.
- `BK-MF1-02`, `BK-MF1-03` e `BK-MF1-04` não têm ocorrências de `../subjects`, `Subject`, `SubjectSchema` ou `subjectId`.
- Não há ocorrências de `notes`, `Comentário pedagógico` ou da explicação genérica "Confirma que a peça criada..." nos BKs da `MF1`.

Erro exato do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Este erro não resulta do conteúdo auditado na `MF1`; o script aponta para `../scripts/validate_planificacao_canonica.py`, que não existe no caminho esperado.

## TODOs restantes
- `TODO (DOCUMENTAL)`: sincronizar drift de `sprint` em `BK-MF1-02` entre matriz/backlog/guia e contrato.
- `TODO (DOCUMENTAL)`: sincronizar drift de `owner` em `BK-MF1-09` entre matriz/backlog/guia e contrato.
- `RESOLVIDO`: representação técnica de sala por disciplina antes de `BK-MF1-08` definida como `disciplineName?: string` em decisão `DERIVADO`.

## Changelog
- `2026-05-30`: relatório atualizado em modo `corrigir_apenas`, com 10 BKs editados, contagem pós-correção `OK: 10`, mapa de integração atualizado, decisões `CANONICO`/`DERIVADO`, drifts preservados e validações documentadas.
- `2026-05-30`: relatório atualizado em modo `auditar_apenas`, sem editar BKs, com reclassificação inicial, mapa de integração, drifts, blockers e ordem recomendada de correção.
