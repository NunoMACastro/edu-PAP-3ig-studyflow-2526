# AUDITORIA-HIDRATACAO-MF1

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `status`: `corrigido`
- `last_updated`: `2026-05-30`
- `modo`: `corrigir_apenas`
- `auditoria`: revisão pedagógica, técnica, correcção documental e integração dos guias BK

## Objetivo
Corrigir os guias BK da `MF1` já auditados, mantendo os headers canónicos e transformando cada BK num tutorial autocontido, executável em termos documentais e coerente com os documentos canónicos.

O código existente em `apps/` foi usado apenas como contexto de localização provável. A fonte de verdade final desta execução foi composta por documentos canónicos, BKs anteriores corrigidos e dependências declaradas.

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
Foram analisados e corrigidos 10 guias BK da `MF1`.

Contagem antes da correcção:
- `OK`: 0
- `PARCIAL`: 5
- `CRÍTICO`: 5

Contagem após a correcção documental:
- `OK`: 10
- `PARCIAL`: 0
- `CRÍTICO`: 0

BKs editados:
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

## Critério aplicado
Um BK foi considerado `OK` se passou a ter objetivo, importância, scope, scope-out, estado antes/depois, pré-requisitos, glossário, conceitos teóricos, arquitectura, passos lineares, ficheiros, código por localização, integração backend/frontend, cenários negativos, critérios de aceite, validação final, evidence, handoff e changelog.

Esta classificação é documental. A implementação real da aplicação não foi criada nesta execução; o que foi corrigido foram os guias de implementação.

## Classificação por BK após correcção
| BK | Estado antes | Estado depois | Lacunas corrigidas |
| --- | --- | --- | --- |
| `BK-MF1-01` | `CRÍTICO` | `OK` | Separados schemas/DTOs, criado fluxo de perfil por área, fontes `READY`, provider IA adaptativo, controller, módulo, cliente e página. |
| `BK-MF1-02` | `PARCIAL` | `OK` | Adicionada validação real de disciplina, membership reutilizável, módulo completo, cliente e página. |
| `BK-MF1-03` | `PARCIAL` | `OK` | Criados schema, DTO, service, controller, módulo actualizado, cliente, página e regra de fonte textual. |
| `BK-MF1-04` | `PARCIAL` | `OK` | Criada IA da sala com filtro de fontes, módulo integrado, bloqueio sem fontes e UI de resposta com fontes. |
| `BK-MF1-07` | `PARCIAL` | `OK` | Fechado módulo de turmas e adicionado fluxo `DERIVADO` para associar alunos por email. |
| `BK-MF1-08` | `PARCIAL` | `OK` | Expandido módulo de disciplinas com ownership por turma, service exportado, cliente e página. |
| `BK-MF1-09` | `CRÍTICO` | `OK` | Removida duplicação de conteúdo, separados `textContent`/`sourceUrl`, estados de fonte, módulo, cliente e página. |
| `BK-MF1-10` | `CRÍTICO` | `OK` | Alinhado cliente com endpoint `PUT`, adicionada normalização de regras, módulo, service exportado e página. |
| `BK-MF1-11` | `CRÍTICO` | `OK` | Resolvida dependência de inscrição via `studentIds`, fontes oficiais processadas, voz docente, módulo e UI. |
| `BK-MF1-12` | `CRÍTICO` | `OK` | Criado módulo de publicações com escrita por professor dono e leitura por aluno inscrito, clientes separados e páginas. |

## Decisões técnicas tomadas
- `BK-MF1-07` passou a incluir associação de aluno por email como decisão `DERIVADO`, porque `RF23` e `RF24` exigem aluno inscrito e nenhum BK anterior fornecia esse estado.
- Salas colaborativas (`StudyRoom`) e turmas oficiais (`SchoolClass`) ficaram separadas. Sala usa `memberIds`; turma usa `studentIds`.
- Materiais oficiais (`OfficialMaterial`) distinguem `textContent` e `sourceUrl`; apenas `TEXT` fica `PROCESSED`.
- Voz docente altera tom e detalhe, mas não remove a obrigação de usar fontes oficiais.
- IA da sala usa apenas `RoomShare.usableByAi`.
- IA adaptativa individual usa apenas materiais da área do aluno com `status: READY` e `contentText`.
- Clientes frontend foram tipados por domínio e usam `credentials: 'include'`.

## Correcção pedagógica adicional
Depois da primeira correcção técnica, foi feita uma segunda passagem focada em alinhar a estrutura dos guias da `MF1` com o padrão pedagógico dos BKs da `MF0`.

Alterações adicionadas aos 10 BKs da `MF1`:
- Conceitos teóricos expandidos, com explicação de origem, destino e finalidade dos campos principais.
- `Guia linear de implementação` reestruturado com `Pré-requisitos concretos`.
- Cada passo passou a seguir o padrão numerado da `MF0`: explicação simples do objetivo, ficheiros envolvidos, o que fazer, código completo, explicação do código, validação e erros comuns.
- Os blocos de código passaram a incluir comentários pedagógicos inline para explicar o que está a acontecer.
- Explicação específica de termos que estavam pobres, incluindo `sourceIds`, `studentIds`, `memberIds`, `usableByAi`, `PROCESSED` e `REFERENCE_ONLY`.

## Mapa de integração da MF
| BK | Módulo principal | Endpoints | DTOs | Schemas/models | Services/exports | Frontend | BKs seguintes dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | `AiModule` | `GET/PUT /api/study-areas/:studyAreaId/learning-profile`, `POST /api/study-areas/:studyAreaId/adaptive-explanations` | `UpdateLearningProfileDto`, `AskAdaptiveExplanationDto` | `LearningProfile`, `AdaptiveExplanation` | `AdaptiveLearningService`, `AI_PROVIDER` | `adaptiveLearning.ts`, `AdaptiveLearningPage` | `BK-MF3-04` |
| `BK-MF1-02` | `StudyRoomsModule` | `POST /api/study-rooms`, `GET /api/study-rooms`, `POST /api/study-rooms/:roomId/members` | `CreateStudyRoomDto`, `AddRoomMemberDto` | `StudyRoom` | `StudyRoomsService.ensureMember` | `studyRooms.ts`, `StudyRoomsPage` | `BK-MF1-03`, `BK-MF1-04`, `BK-MF3-05` |
| `BK-MF1-03` | `StudyRoomsModule` | `POST /api/study-rooms/:roomId/shares`, `GET /api/study-rooms/:roomId/shares` | `CreateRoomShareDto` | `RoomShare` | `RoomSharesService.findUsableSharesForRoom` | `roomShares.ts`, `RoomSharesPage` | `BK-MF1-04` |
| `BK-MF1-04` | `StudyRoomsModule` | `POST /api/study-rooms/:roomId/ai/answers` | `AskRoomAiDto` | `RoomAiInteraction` | `RoomAiService` | `roomAi.ts`, `RoomAiPage` | Guardrails para BKs posteriores de IA colaborativa |
| `BK-MF1-07` | `ClassesModule` | `POST /api/teacher/classes`, `GET /api/teacher/classes`, `POST /api/teacher/classes/:classId/students`, `GET /api/student/classes` | `CreateClassDto`, `AddClassStudentDto` | `SchoolClass` | `ClassesService.findOwnedClass`, `ClassesService.ensureStudentEnrollment` | `classes.ts`, `TeacherClassesPage`, `StudentClassesPage` | `BK-MF1-08`, `BK-MF1-11`, `BK-MF1-12`, `BK-MF2-01`, `BK-MF2-02` |
| `BK-MF1-08` | `SubjectsModule` | `POST /api/teacher/classes/:classId/subjects`, `GET /api/teacher/classes/:classId/subjects` | `CreateSubjectDto` | `Subject` | `SubjectsService.findOwnedSubject`, `SubjectsService.findSubjectForStudent` | `subjects.ts`, `TeacherSubjectsPage` | `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-04` |
| `BK-MF1-09` | `OfficialMaterialsModule` | `POST /api/teacher/subjects/:subjectId/materials`, `GET /api/teacher/subjects/:subjectId/materials` | `CreateOfficialMaterialDto` | `OfficialMaterial` | `OfficialMaterialsService.findProcessedBySubject` | `officialMaterials.ts`, `TeacherOfficialMaterialsPage` | `BK-MF1-10`, `BK-MF1-11`, `BK-MF2-05`, `BK-MF2-07` |
| `BK-MF1-10` | `TeacherAiModule` | `PUT /api/teacher/subjects/:subjectId/ai-voice`, `GET /api/teacher/subjects/:subjectId/ai-voice` | `UpdateTeacherAiVoiceDto` | `TeacherAiVoice` | `TeacherAiVoiceService.findForSubject` | `teacherAiVoice.ts`, `TeacherAiVoicePage` | `BK-MF1-11`, `BK-MF2-12` |
| `BK-MF1-11` | `ClassAiModule` | `POST /api/student/subjects/:subjectId/ai/answers` | `AskClassAiDto` | `ClassAiInteraction` | `ClassAiService` | `classAi.ts`, `StudentClassAiPage` | `BK-MF2-12`, BKs de guardrails de IA |
| `BK-MF1-12` | `ClassPostsModule` | `POST /api/teacher/classes/:classId/posts`, `GET /api/teacher/classes/:classId/posts`, `GET /api/student/classes/:classId/posts` | `CreateClassPostDto` | `ClassPost` | `ClassPostsService` | `classPosts.ts`, `TeacherClassPostsPage`, `StudentClassPostsPage` | `BK-MF2-06`, `BK-MF4-01` |

## Coerência global após correcção
- A cadeia docente ficou fechada: `SchoolClass` -> `Subject` -> `OfficialMaterial` -> `TeacherAiVoice` -> `ClassAiInteraction` -> `ClassPost`.
- A cadeia colaborativa ficou fechada: `StudyRoom` -> `RoomShare` -> `RoomAiInteraction`.
- A cadeia individual ficou fechada: `StudyArea` + `Material` -> `LearningProfile` -> `AdaptiveExplanation`.
- O problema de `studentIds` foi resolvido por um endpoint derivado em `BK-MF1-07`.
- O conflito de método HTTP em `BK-MF1-10` foi corrigido para `PUT` no cliente e no controller.
- O DTO duplicado de `BK-MF1-09` foi substituído por contrato explícito `textContent`/`sourceUrl`.

## Drift documental encontrado
- `BK-MF1-02`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e o guia indicam `sprint: S02`, mas `CONTRATO-CAMPOS-BK.md` indica `S03`.
- `BK-MF1-09`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e o guia indicam `owner: Kaua`, mas `CONTRATO-CAMPOS-BK.md` indica `Guilherme`.
- `BK-MF1-04`: o header canónico mantém dependência `BK-MF1-02`; o guia corrigido explicita dependência técnica de `BK-MF1-03` no corpo, porque a IA da sala precisa de partilhas.

## Lacunas restantes
- Não ficaram `TODOs` funcionais dentro dos BKs corrigidos.
- A implementação real da app ainda terá de ser feita seguindo estes guias.
- O validador canónico não pôde correr por falha de infraestrutura descrita abaixo.

## Validação obrigatória
Comandos executados nesta execução:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|snippet|pseudo-código|implementar depois|quando aplicável|helpers chamados|Substitui os mocks|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/MF1/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado:
- Pesquisa textual nos BKs da `MF1`: sem ocorrências.
- `git diff --check`: passou.
- `bash scripts/validate-planificacao.sh`: falhou por bloqueio de infraestrutura do validador.

Erro exacto do validador:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Este erro não resulta do conteúdo dos BKs corrigidos. O script `scripts/validate-planificacao.sh` aponta para `../scripts/validate_planificacao_canonica.py`, que não existe no caminho esperado.

## Changelog
- `2026-05-30`: relatório actualizado em modo `corrigir_apenas`, com contagem antes/depois, BKs editados, mapa de integração obrigatório, drift documental e validações executadas.
