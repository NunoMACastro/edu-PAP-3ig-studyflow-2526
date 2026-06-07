# Auditoria de guias BK - MF2

## Metadados

- MF processada: `MF2`
- Modo: `auditar_apenas`
- Estado: `auditado, sem edicao dos BKs`
- Data: `2026-06-07`
- Escopo: auditoria documental, pedagogica e tecnica dos BKs da `MF2`.
- BKs analisados: `12`
- BKs editados nesta execucao: `0`
- Codigo em `apps/`: tratado como codigo inicial nao validado; nao foi usado como contrato tecnico final.

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
- BKs de `MF0`, `MF1`, `MF2` e BKs posteriores com dependencias em `MF2`.

## Resultado da auditoria

| Momento | `OK` | `PARCIAL` | `CRITICO` |
| --- | ---: | ---: | ---: |
| Estado auditado antes de qualquer correcao | 0 | 0 | 12 |
| Depois desta execucao | 0 | 0 | 12 |

Como esta execucao esta em `auditar_apenas`, nenhum BK foi corrigido. A classificacao `CRITICO` aplica-se aos 12 BKs porque os guias aparentam ter estrutura e blocos de codigo, mas o codigo nao implementa o dominio real dos requisitos, nao consome os services canonicos declarados e apresenta endpoints contraditorios entre controller, cliente frontend e validacao.

## Classificacao por BK

| BK | Estado | Problema principal | Exemplo concreto | Prioridade de correcao |
| --- | --- | --- | --- | --- |
| `BK-MF2-01` | `CRITICO` | Sala guiada nao valida turma/professor nem membership. | Controller usa `api/guided-study-rooms/:contextId`, mas a validacao manda chamar `POST /api/teacher/classes/:classId/guided-study-rooms`; `ClassesService.findOwnedClass` e `ensureStudentEnrollment` sao mencionados, mas nao importados nem chamados. | 1 |
| `BK-MF2-02` | `CRITICO` | Projeto de turma e reduzido a entidade generica `contextId/title/description/status`. | Endpoint real no codigo e `api/class-projects/:contextId`, divergindo de `POST /api/teacher/classes/:classId/projects`; nao ha validacao de professor dono da turma. | 2 |
| `BK-MF2-03` | `CRITICO` | IA de projeto nao usa projeto publicado, fontes, provider IA nem plano gradual real. | O texto cita `ClassProjectsService.findPublishedForStudent` e `AI_PROVIDER`, mas o service so faz `model.create` com `title` e `description`. | 3 |
| `BK-MF2-04` | `CRITICO` | Testes oficiais nao modelam perguntas, respostas, disciplina, publicacao ou validacao docente. | Controller usa `api/official-tests/:contextId`; falta `SubjectsService.findOwnedSubject` e falta contrato MCQ com uma correta e distratores. | 4 |
| `BK-MF2-05` | `CRITICO` | Revisao docente de conteudo IA nao liga materiais oficiais, artefactos IA, aprovacao/rejeicao ou estado de curadoria. | `OfficialMaterialsService` e `SubjectsService` aparecem no texto, mas nao no codigo; schema e DTO continuam genericos. | 5 |
| `BK-MF2-06` | `CRITICO` | Painel de progresso nao agrega progresso, dificuldades ou metricas da turma. | Codigo cria/lista `ClassProgressEvent` por `contextId`; nao consulta `ClassPostsService`, turma, alunos, historico ou metricas. | 6 |
| `BK-MF2-07` | `CRITICO` | Indexacao automatica nao indexa PDF/DOCX/URL, nao cria job real nem separa material de aluno/professor. | Falta consumo de `MaterialsService` e `OfficialMaterialsService`; endpoint codificado `api/material-index/:contextId` contradiz `/api/study-areas/:studyAreaId/materials/:materialId/index`. | 7 |
| `BK-MF2-08` | `CRITICO` | Extracao de topicos/estrutura/referencias nao usa segmentos ou output do job de indexacao. | O guia declara `MaterialIndexService.findSegmentsForJob`, mas o codigo nao importa `MaterialIndexService` nem produz topicos, secoes ou referencias. | 8 |
| `BK-MF2-09` | `CRITICO` | Versionamento de materiais nao liga a `Material`/`OfficialMaterial`, nao guarda snapshots nem permite reversao. | Endpoint esperado e `/api/material-versions`, mas controller implementa `POST/GET api/material-versions/:contextId`; schema generico nao representa versoes. | 9 |
| `BK-MF2-10` | `CRITICO` | Separacao aluno/professor/turma nao classifica nem filtra materiais por contexto real. | Texto cita `ClassesService` e `SubjectsService`, mas o service nao os consome; endpoint `api/material-contexts/:contextId` contradiz `/api/material-contexts/student`. | 10 |
| `BK-MF2-11` | `CRITICO` | Assistente IA privado nao usa area do aluno, fontes processaveis, provider IA, historico nem bloqueio sem fontes. | Service so persiste `title/description`; `StudyAreasService` e `MaterialIndexService` sao apenas mencionados. | 11 |
| `BK-MF2-12` | `CRITICO` | Assistente IA de disciplina/turma nao usa voz docente, materiais oficiais, disciplina inscrita ou guardrails de turma. | `TeacherAiVoiceService` e `MaterialIndexService` nao sao importados; controller `api/class-ai/:contextId` contradiz `/api/student/subjects/:subjectId/ai/answers`. | 12 |

## Problemas transversais

- Os 12 BKs seguem uma forma parecida com MF0, mas o conteudo tecnico e repetido e generico.
- Todos os services auditados usam o padrao `contextId`, `createdBy`, `title`, `description` e `status`, independentemente do requisito.
- Os services mencionam ownership/membership na explicacao, mas nao importam nem chamam os services canonicos que aplicam essas regras.
- Os endpoints apresentados nos controllers nao batem com os endpoints indicados nos proprios passos de validacao.
- Os BKs de IA nao chamam `AI_PROVIDER`, nao constroem prompts, nao bloqueiam sem fontes e nao separam IA privada de IA de turma.
- Os BKs de materiais nao implementam indexacao, extracao, versionamento ou separacao real de contextos.
- A validacao por passo existe formalmente, mas valida smoke textual em vez de validar contratos executaveis.
- Nao foram encontradas expressoes proibidas nos BKs da MF2 pela pesquisa textual obrigatoria.

## Gate de app funcional

| Pergunta | Resultado |
| --- | --- |
| Este codigo compila no contexto da app final prevista? | `NAO SEI/NAO`. Ha imports locais plausiveis, mas os contratos essenciais nao sao importados nem integrados. |
| Os imports apontam para ficheiros existentes ou criados em BKs anteriores? | `PARCIAL`. Imports basicos existem, mas imports canonicos declarados no texto nao aparecem no codigo. |
| O controller chama um service existente? | `PARCIAL`. Chama o service do proprio BK, mas com endpoints contraditorios. |
| O service usa schemas/models existentes? | `PARCIAL`. Usa o schema criado no proprio BK, mas nao reutiliza modelos canonicos quando o requisito exige. |
| O frontend chama endpoints reais definidos no backend? | `NAO`. Os endpoints esperados nos passos divergem dos controllers gerados. |
| Os tipos do frontend correspondem ao payload e resposta do backend? | `PARCIAL`. Correspondem ao contrato generico, nao ao dominio real. |
| O fluxo funciona com autenticacao real? | `PARCIAL`. Ha `SessionGuard`, mas falta autorizacao por turma, disciplina, area e material. |
| O fluxo falha de forma controlada nos negativos? | `NAO`. Os negativos centrais de ownership, membership, fontes e permissao docente nao estao implementados. |
| Este BK deixa a app num estado mais funcional do que antes? | `NAO` para o dominio real; cria CRUD generico. |
| O proximo BK consegue construir sobre este sem reescrever tudo? | `NAO`. BKs seguintes dependeriam de services e endpoints que nao existem com a semantica prometida. |

## Mapa de integracao da MF

| BK | Ficheiros que o guia diz criar | Endpoint codificado | Endpoint esperado pelo proprio guia | Imports canonicos mencionados mas ausentes no codigo | Dependentes principais |
| --- | --- | --- | --- | --- | --- |
| `BK-MF2-01` | `guided-study-rooms/*` | `POST/GET api/guided-study-rooms/:contextId` | `POST /api/teacher/classes/:classId/guided-study-rooms` | `ClassesService` | `BK-MF2-02` |
| `BK-MF2-02` | `class-projects/*` | `POST/GET api/class-projects/:contextId` | `POST /api/teacher/classes/:classId/projects` | `ClassesService` | `BK-MF2-03` |
| `BK-MF2-03` | `project-ai/*` | `POST/GET api/project-ai/:contextId` | `POST /api/student/classes/:classId/projects/:projectId/ai-plan` | `ClassProjectsService`, `AI_PROVIDER` | `BK-MF2-04` |
| `BK-MF2-04` | `official-tests/*` | `POST/GET api/official-tests/:contextId` | `POST /api/teacher/subjects/:subjectId/tests` | `SubjectsService` | `BK-MF2-05` |
| `BK-MF2-05` | `ai-content-reviews/*` | `POST/GET api/ai-content-reviews/:contextId` | `POST /api/teacher/subjects/:subjectId/ai-content-reviews` | `SubjectsService`, `OfficialMaterialsService` | `BK-MF2-06` |
| `BK-MF2-06` | `class-progress/*` | `POST/GET api/class-progress/:contextId` | `GET /api/teacher/classes/:classId/progress-dashboard` | `ClassesService`, `ClassPostsService` | `BK-MF2-07` |
| `BK-MF2-07` | `material-index/*` | `POST/GET api/material-index/:contextId` | `POST /api/study-areas/:studyAreaId/materials/:materialId/index` | `MaterialsService`, `OfficialMaterialsService` | `BK-MF2-08`, `BK-MF3-02`, `BK-MF3-09`, `BK-MF3-10` |
| `BK-MF2-08` | `material-structure/*` | `POST/GET api/material-structure/:contextId` | `POST /api/material-index/jobs/:jobId/structure` | `MaterialIndexService.findSegmentsForJob` | `BK-MF2-09` |
| `BK-MF2-09` | `material-versions/*` | `POST/GET api/material-versions/:contextId` | `POST /api/material-versions` | `Material`, `OfficialMaterial` | `BK-MF2-10` |
| `BK-MF2-10` | `material-contexts/*` | `POST/GET api/material-contexts/:contextId` | `GET /api/material-contexts/student` | `ClassesService`, `SubjectsService` | `BK-MF2-11`, `BK-MF2-12` |
| `BK-MF2-11` | `private-area-ai/*` | `POST/GET api/private-area-ai/:contextId` | `POST /api/study-areas/:studyAreaId/private-ai/answers` | `StudyAreasService`, `MaterialIndexService`, `AI_PROVIDER` | `BK-MF3-01`, `BK-MF3-03`, `BK-MF4-02`, `BK-MF4-09` |
| `BK-MF2-12` | `class-ai/*` | `POST/GET api/class-ai/:contextId` | `POST /api/student/subjects/:subjectId/ai/answers` | `TeacherAiVoiceService`, `MaterialIndexService`, `AI_PROVIDER` | `BK-MF3-01` |

Conclusao do mapa: existem endpoints duplicados ou genericos para acoes especificas, schemas genericos para entidades distintas, e frontend/backend/documentacao nao partilham o mesmo contrato de rota. A macrofase nao deve ser fechada como pronta.

## Dependencias a reler antes da correcao

- `BK-MF2-01`, `BK-MF2-02`, `BK-MF2-06`: reler `BK-MF1-07`, `BK-MF1-12`, `RF19`, `RF24`, `RF25`, `RF26`, `RF30`.
- `BK-MF2-03`: reler `BK-MF2-02`, `BK-MF0-12`, `BK-MF1-01`, `RF27`, criterios de projetos.
- `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-12`: reler `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `RF20`, `RF21`, `RF22`, `RF28`, `RF29`, `RF36`.
- `BK-MF2-07`, `BK-MF2-08`, `BK-MF2-09`, `BK-MF2-10`: reler `BK-MF0-08`, `BK-MF1-09`, `RF31` a `RF34`, `RNF11`, `RNF18`, `RNF31`, `RNF35`.
- `BK-MF2-11`: reler `BK-MF0-10`, `BK-MF0-11`, `BK-MF0-12`, `RF35`, `RF37`, `RF39`, `RF50`, `RF57`.

## Ordem recomendada de correcao

1. `BK-MF2-07` - corrigir a base de indexacao real, porque desbloqueia extracao, versoes, separacao de materiais, IA com fontes e BKs posteriores.
2. `BK-MF2-08`
3. `BK-MF2-09`
4. `BK-MF2-10`
5. `BK-MF2-11`
6. `BK-MF2-12`
7. `BK-MF2-02`
8. `BK-MF2-03`
9. `BK-MF2-04`
10. `BK-MF2-05`
11. `BK-MF2-06`
12. `BK-MF2-01`

## Verificacoes textuais executadas

### Pesquisa obrigatoria

Comando:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|conversa interna|este guia deixa de ser|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-código|solução parcial|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/MF2/*.md
```

Resultado: sem ocorrencias nos BKs da MF2. O `rg` terminou com exit code `1`, que neste caso significa zero matches.

### Estrutura dos BKs

Resultado:

- `BK-MF2-01`, `BK-MF2-02`, `BK-MF2-03`, `BK-MF2-05`, `BK-MF2-06` e `BK-MF2-09`: `6` passos cada, cumprindo o minimo estrutural para `P1/P2`.
- `BK-MF2-04`, `BK-MF2-07`, `BK-MF2-08`, `BK-MF2-10`, `BK-MF2-11` e `BK-MF2-12`: `8` passos cada, cumprindo o minimo estrutural para `P0`.

### `git diff --check`

Resultado: passou sem output.

### `bash scripts/validate-planificacao.sh`

Resultado: passou com `overall_pass: true` e score `100/100`.

## Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: os BKs da MF2 precisam de reescrita tecnica antes de serem entregues a alunos; em `auditar_apenas` nao foram corrigidos.
- `TODO (BLOCKER)`: nao e possivel marcar nenhum BK da MF2 como `OK` porque o codigo atual nao cumpre o contrato de executabilidade da app final prevista.
