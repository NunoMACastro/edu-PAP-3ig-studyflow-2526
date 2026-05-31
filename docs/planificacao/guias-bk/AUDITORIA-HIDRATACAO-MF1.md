# Auditoria e correção de guias BK - MF1

## Metadados

- MF processada: `MF1`
- Modo: `corrigir_apenas`
- Estado: `corrigido`
- Data: `2026-05-31`
- Escopo: guias em `docs/planificacao/guias-bk/MF1/*.md`
- BKs analisados: `10`
- BKs editados nesta execução: `6`

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
- Todos os BKs da `MF0`
- Todos os BKs da `MF1`
- BKs posteriores dependentes em `MF2`, `MF3` e `MF4`

## Resultado antes/depois

| Momento | `OK` | `PARCIAL` | `CRÍTICO` |
| --- | ---: | ---: | ---: |
| Antes da correção | 4 | 6 | 0 |
| Depois da correção | 10 | 0 | 0 |

Antes da correção, `BK-MF1-07` a `BK-MF1-12` estavam `PARCIAL` porque a cadeia docente exigia sessão real de professor, mas a sequência MF0 -> MF1 não dizia como obter uma conta `TEACHER` executável. A correção escolhida foi preparar `MONGODB_URI` local para MongoDB Atlas e acrescentar uma seed local de desenvolvimento em `BK-MF1-07`, bloqueada em produção, para criar professor e aluno de validação sem transformar isto em gestão real de papéis.

## Classificação final por BK

| BK | Estado final | Justificação |
| --- | --- | --- |
| `BK-MF1-01` | `OK` | Aprendizagem adaptativa individual mantém perfil, fontes, provider IA e guardrails. |
| `BK-MF1-02` | `OK` | Salas de estudo continuam coerentes com membership e partilha posterior. Mantém drift documental de sprint. |
| `BK-MF1-03` | `OK` | Partilha de materiais da sala valida membership e prepara `RoomSharesService`. |
| `BK-MF1-04` | `OK` | IA partilhada usa fontes partilhadas, membership e bloqueio sem contexto. Mantém drift documental de dependência técnica. |
| `BK-MF1-07` | `OK` | Agora inclui preparação do MongoDB Atlas, `MONGODB_URI` local e seed segura para criar professor/aluno de desenvolvimento e validar turmas com sessão real. |
| `BK-MF1-08` | `OK` | Pré-requisitos e validação usam o professor de desenvolvimento criado no `BK-MF1-07`. |
| `BK-MF1-09` | `OK` | Materiais oficiais usam professor real de desenvolvimento e mantêm separação `PROCESSED`/`REFERENCE_ONLY`. Mantém drift documental de owner. |
| `BK-MF1-10` | `OK` | Voz docente textual usa professor real de desenvolvimento e continua limitada a estilo, não a fonte. |
| `BK-MF1-11` | `OK` | IA limitada usa aluno inscrito real, materiais oficiais processados e voz docente. |
| `BK-MF1-12` | `OK` | Publicações usam professor/aluno reais e validação por ownership/inscrição. |

## BKs editados

- `docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`

## Lacunas corrigidas

- `BK-MF1-07` passou a explicar como preparar MongoDB Atlas para desenvolvimento: utilizador da base de dados, IP público autorizado e `MONGODB_URI` local.
- O guia passou a reforçar que `apps/api/.env` não deve entrar no Git e que a connection string não deve aparecer em commits.
- `BK-MF1-07` passou a documentar `apps/api/src/scripts/seed-development-users.ts`.
- A seed usa `MONGODB_URI`, `bcrypt`, `User`, `UserSchema` e roles da MF0.
- A seed recusa `NODE_ENV=production`.
- A seed cria apenas contas locais de validação: `professor.dev@studyflow.local` (`TEACHER`) e `aluno.dev@studyflow.local` (`STUDENT`).
- A seed não altera contas existentes com papel incompatível.
- `BK-MF1-08` a `BK-MF1-12` passaram a declarar explicitamente que a validação usa professor/aluno criados no `BK-MF1-07`.
- Expected results, evidence, handoff e changelog dos BKs docentes foram alinhados com validação por sessão real.

## Decisões técnicas confirmadas

- A seed é ferramenta local de desenvolvimento, não funcionalidade de produto nem gestão real de papéis.
- A connection string do MongoDB Atlas deve ficar em `MONGODB_URI` local e não é uma key pública de aplicação.
- O acesso Atlas deve usar utilizador de base de dados com permissões limitadas e IP access list restrita ao desenvolvimento sempre que possível.
- Gestão administrativa de papéis continua pertencente ao fluxo próprio de administração, associado a RF55.
- Voz docente continua a ser estilo pedagógico textual, não áudio.
- URLs de materiais oficiais continuam `REFERENCE_ONLY` e não alimentam IA factual antes de processamento textual.
- IA limitada continua a bloquear sem materiais oficiais `PROCESSED`.
- `teacherId`, `studentId`, ownership e inscrição continuam a vir da sessão/base de dados, não de IDs livres enviados pelo frontend.

## Drift documental encontrado

| Item | Drift | Estado |
| --- | --- | --- |
| `BK-MF1-02` | `CONTRATO-CAMPOS-BK.md` e `MATRIZ-CANONICA-BK.md` indicam `S03`; `BACKLOG-MVP.md` e guia indicam `S02`. | Mantido, sem alteração por falta de decisão documental única. |
| `BK-MF1-09` | `CONTRATO-CAMPOS-BK.md` e `MATRIZ-CANONICA-BK.md` indicam owner `Guilherme`; `BACKLOG-MVP.md` e guia indicam `Kaua`. | Mantido, sem alteração por falta de decisão documental única. |
| `BK-MF1-04` | Header/contrato declaram dependência de `BK-MF1-02`; corpo usa tecnicamente `RoomSharesService` de `BK-MF1-03`. | Mantido como dependência técnica derivada. |
| BKs posteriores | Alguns BKs dependentes em `MF2`, `MF3` e `MF4` continuam em formato curto/legacy. | Fora do escopo desta execução. |

## Mapa de integração da MF

| BK | Ficheiros criados/editados no guia | Exports/elementos produzidos | Imports/consumos principais | Endpoints | Dependentes |
| --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | Perfil, DTOs, prompt, provider, service, controller, API web e página de IA adaptativa | `AdaptiveLearningService`, profile/adaptive explanation | `Material`, `StudyAreasService`, `AI_PROVIDER`, `SessionGuard` | `GET/PUT /api/study-areas/:studyAreaId/learning-profile`, `POST /api/study-areas/:studyAreaId/adaptive-explanations` | Personalização individual da IA |
| `BK-MF1-02` | `StudyRoom`, DTOs, service, controller, module, API web e página | `StudyRoomsService` | `SessionGuard`, utilizador autenticado | `POST/GET /api/study-rooms`, `POST /api/study-rooms/:roomId/members` | `BK-MF1-03`, `BK-MF1-04` |
| `BK-MF1-03` | `RoomShare`, DTO, service, controller, update de module, API web e página | `RoomSharesService` | `StudyRoomsService.ensureMember`, `Material` | `POST/GET /api/study-rooms/:roomId/shares` | `BK-MF1-04` |
| `BK-MF1-04` | `RoomAiInteraction`, DTO, prompt, service, controller, module, API web e página | IA colectiva da sala | `StudyRoomsService`, `RoomSharesService`, `AI_PROVIDER` | `POST /api/study-rooms/:roomId/ai/answers` | Fecho RF14-RF16 |
| `BK-MF1-07` | `apps/api/.env`, `seed-development-users.ts`, `SchoolClass`, DTOs, service, controller, module, APIs web e páginas teacher/student | `MONGODB_URI` local, contas locais de validação, `ClassesService`, `SchoolClass.studentIds` | MongoDB Atlas, `User`, `UserSchema`, `bcrypt`, `MONGODB_URI`, `SessionGuard` | `POST/GET /api/teacher/classes`, `POST /api/teacher/classes/:classId/students`, `GET /api/student/classes` | `BK-MF1-08`, `BK-MF1-11`, `BK-MF1-12` |
| `BK-MF1-08` | `Subject`, DTO, service, controller, module, API web e página | `SubjectsService`, `findOwnedSubject`, `findSubjectForStudent` | `ClassesService.findOwnedClass`, professor de desenvolvimento | `POST/GET /api/teacher/classes/:classId/subjects` | `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11` |
| `BK-MF1-09` | `OfficialMaterial`, DTO, service, controller, module, API web e página | `OfficialMaterialsService`, materiais `PROCESSED`/`REFERENCE_ONLY` | `SubjectsService.findOwnedSubject`, professor de desenvolvimento | `POST/GET /api/teacher/subjects/:subjectId/materials` | `BK-MF1-11` |
| `BK-MF1-10` | `TeacherAiVoice`, DTO, service, controller, module, API web e página | `TeacherAiVoiceService` | `SubjectsService.findOwnedSubject`, professor de desenvolvimento | `PUT/GET /api/teacher/subjects/:subjectId/ai-voice` | `BK-MF1-11` |
| `BK-MF1-11` | `ClassAiInteraction`, DTO, prompt, service, controller, module, API web e página | IA limitada por disciplina/turma | `SubjectsService`, `OfficialMaterialsService`, `TeacherAiVoiceService`, `AI_PROVIDER`, aluno inscrito | `POST /api/student/subjects/:subjectId/ai/answers` | Fluxos discentes posteriores |
| `BK-MF1-12` | `ClassPost`, DTO, service, controller, module, APIs web e páginas teacher/student | Publicações oficiais da turma | `ClassesService.findOwnedClass`, `ClassesService.ensureStudentEnrollment`, professor/aluno de desenvolvimento | `POST/GET /api/teacher/classes/:classId/posts`, `GET /api/student/classes/:classId/posts` | `BK-MF2-01` |

## Verificações textuais executadas

### Pesquisa obrigatória

Comando:

```bash
rg -n "hidrata|pós-auditoria|scaffold|roteiro genérico|conversa interna|este guia deixa de ser|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-código|solução parcial|payload: unknown|as any|ContextAction|contextApi" docs/planificacao/guias-bk/MF1/*.md
```

Resultado: sem ocorrências nos BKs MF1. O `rg` terminou com exit code `1`, que neste caso significa zero matches.

### Blocos de código

Resultado: não foram encontrados blocos `ts`/`tsx` sem comentário inicial com caminho de ficheiro.

## Verificações de comandos

### `git diff --check`

Resultado: passou sem output.

### `bash scripts/validate-planificacao.sh`

Resultado: falhou antes de executar a validação canónica por bloqueio de infraestrutura já existente.

Output observado:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Causa confirmada: `scripts/validate-planificacao.sh` chama `python3 ../scripts/validate_planificacao_canonica.py --project studyflow --json`, mas o ficheiro Python referido não existe neste workspace; `scripts/` contém apenas `validate-planificacao.sh`.

## Bloqueios e TODOs restantes

- `TODO`: resolver drift de sprint de `BK-MF1-02`.
- `TODO`: resolver drift de owner de `BK-MF1-09`.
- `TODO`: decidir se `BK-MF1-04` deve declarar formalmente `BK-MF1-03` como dependência.
- `TODO`: corrigir o caminho do validador canónico ou repor `../scripts/validate_planificacao_canonica.py`.
- `TODO`: hidratar BKs posteriores dependentes em `MF2`, `MF3` e `MF4` quando essas macrofases entrarem em escopo.
