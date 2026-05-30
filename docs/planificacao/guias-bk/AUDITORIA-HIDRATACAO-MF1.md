# AUDITORIA-HIDRATACAO-MF1

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `status`: `draft-pos-revisao-mf1`
- `last_updated`: `2026-05-30`
- `auditoria`: revisão pedagógica/técnica dos guias BK

## Objetivo
Auditar os guias BK da `MF1` para confirmar se são tutoriais executáveis por alunos do 12.º ano, com objetivo claro, scope, dependências, ficheiros, localização, código integrado, validação, cenários negativos, expected results, evidence e handoff.

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
- BKs posteriores que dependem da MF1 em `MF2`, `MF3` e `MF4`
- Estrutura prevista da aplicação em `apps/api` e `apps/web` usada apenas como contexto de localização, não como solução corrigida.

## Resumo executivo
Foram analisados 10 guias BK da `MF1`.

Resultado inicial:
- `OK`: 0
- `PARCIAL`: 0
- `CRÍTICO`: 10

Todos os BKs da MF1 estavam em estado `CRÍTICO`: tinham headers e alguns passos, mas os passos eram genéricos, vários domínios estavam trocados, os blocos de código anteriores eram reutilizados sem relação real com o requisito e faltavam ficheiros concretos, localização de edição, código final integrado, expected results e cenários negativos de segurança.

## Atualização pós-revisão (2026-05-30)
Foram revistos os 10 guias BK da `MF1`. A revisão manteve os headers canónicos existentes e substituiu o corpo anterior por tutoriais lineares com scope, scope-out, metadados `CANONICO/DERIVADO`, pré-leitura, glossário, conceitos, ficheiros concretos, código NestJS/React, validação e handoff.

O código existente em `apps` foi tratado como resolução inicial dos alunos e não como contrato técnico final. Os BKs passaram a descrever a implementação esperada para a estrutura final da aplicação.

| BK | Classificação inicial | Estado pós-revisão | Nota |
| --- | --- | --- | --- |
| BK-MF1-01 | `CRÍTICO` | `HIDRATADO` | Perfil de aprendizagem individual, adaptação de prompt e bloqueio sem fontes. |
| BK-MF1-02 | `CRÍTICO` | `HIDRATADO` | Salas livres/por disciplina com membership inicial e ownership. |
| BK-MF1-03 | `CRÍTICO` | `HIDRATADO` | Partilha de notas/materiais na sala com autoria e validação. |
| BK-MF1-04 | `CRÍTICO` | `HIDRATADO` | IA da sala limitada a fontes partilhadas e bloqueio sem fontes. |
| BK-MF1-07 | `CRÍTICO` | `HIDRATADO` | Turmas com professor owner, código único e negativos P0. |
| BK-MF1-08 | `CRÍTICO` | `HIDRATADO` | Disciplinas associadas a turmas do professor. |
| BK-MF1-09 | `CRÍTICO` | `HIDRATADO` | Materiais oficiais de disciplina com ownership docente. |
| BK-MF1-10 | `CRÍTICO` | `HIDRATADO` | Voz docente como estilo pedagógico textual, sem clonagem vocal. |
| BK-MF1-11 | `CRÍTICO` | `HIDRATADO` | IA limitada para aluno inscrito, apenas com materiais oficiais processáveis. |
| BK-MF1-12 | `CRÍTICO` | `HIDRATADO` | Avisos/publicações por turma com isolamento por professor owner. |

## Problemas concretos encontrados antes da revisão

| BK | Estado | Problema principal | Exemplos de secções vagas | O que faltava completar | Risco pedagógico | Risco técnico | Dependências relidas | Prioridade |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF1-01 | `CRÍTICO` | Snippet de registo sem relação com adaptação IA. | “fluxo de conta/perfil”, handler de registo. | Perfil pedagógico, prompt, ownership, bloqueio sem fontes. | Aluno não percebe RF13. | IA podia personalizar sem fontes. | BK-MF0-11, BK-MF0-12 | Alta |
| BK-MF1-02 | `CRÍTICO` | Guia tratava como fluxo docente, não salas de alunos. | Autorização por turma/disciplina com papel professor. | Schema de sala, membership, endpoint. | Confusão entre sala livre e turma. | Permissões erradas. | BK-MF0-03 | Alta |
| BK-MF1-03 | `CRÍTICO` | Partilha de materiais não tinha modelo nem endpoint. | Snippet de registo e sessão. | RoomShare, autoria, materialId/nota, negativos. | Não implementável. | Exposição a não-membros. | BK-MF1-02 | Alta |
| BK-MF1-04 | `CRÍTICO` | IA de sala tinha código anterior sem relação com fontes partilhadas. | Sem fontes, sem guardrails. | RoomAiService, fontes partilhadas, bloqueio sem fontes. | Promete IA sem explicar limites. | Alucinação e mistura de dados. | BK-MF1-02, BK-MF1-03 | Alta |
| BK-MF1-07 | `CRÍTICO` | Turmas sem schema/controller real. | Autorização genérica por contexto. | SchoolClass, teacher owner, código único. | Professor não consegue seguir o guia. | Qualquer utilizador poderia criar turma. | RF19 | Muito alta |
| BK-MF1-08 | `CRÍTICO` | Disciplinas sem associação segura a turma. | Fluxo turma/disciplina abstrato. | Subject, assertTeacherOwnsClass, duplicados. | Falta de ponte para materiais oficiais. | Disciplina em turma errada. | BK-MF1-07 | Muito alta |
| BK-MF1-09 | `CRÍTICO` | Materiais oficiais sem validação/ownership. | Endpoint só implícito. | OfficialMaterial, estado de processamento, URL válida. | Alunos não veem diferença entre material pessoal/oficial. | Upload/publicação indevida. | BK-MF1-08 | Muito alta |
| BK-MF1-10 | `CRÍTICO` | Voz docente sem contrato seguro. | Autorização genérica. | TeacherAiVoice, tom/guidance/rigor, sanitização. | Confusão com clonagem vocal. | Prompt injection por instruções livres. | BK-MF1-09 | Alta |
| BK-MF1-11 | `CRÍTICO` | IA limitada sem matrícula, fontes ou voz docente. | Autorização docente errada. | Inscrição, fontes oficiais, bloqueio sem fontes. | Aluno pode achar que IA responde livremente. | Mistura IA privada/turma. | BK-MF1-10 | Muito alta |
| BK-MF1-12 | `CRÍTICO` | Avisos/publicações eram descritos como notificações genéricas. | Quotas/canais fora desta fase. | ClassPost, professor owner, visibilidade da turma. | Não separa comunicação oficial de notificações futuras. | Publicações em turmas erradas. | BK-MF1-07 | Alta |

## Drift documental encontrado
- `BK-MF1-02`: o guia e a tabela global do `BACKLOG-MVP.md` indicam `sprint: S02`, mas `CONTRATO-CAMPOS-BK.md` indica `S03`. Não foi alterado porque a instrução desta execução proíbe mudar sprint sem evidência documental clara.
- `BK-MF1-09`: o guia e a tabela global do `BACKLOG-MVP.md` indicam `owner: Kaua`, mas `CONTRATO-CAMPOS-BK.md` indica `Guilherme`. Não foi alterado pelo mesmo motivo.
- Alguns BKs posteriores ainda dependentes da MF1 mantêm formato antigo e deverão ser revistos quando a respetiva MF for alvo.

## Ordem de revisão aplicada
1. BK-MF1-07
2. BK-MF1-08
3. BK-MF1-09
4. BK-MF1-10
5. BK-MF1-11
6. BK-MF1-12
7. BK-MF1-02
8. BK-MF1-03
9. BK-MF1-04
10. BK-MF1-01

## Validação pós-edição
A validação obrigatória deve ser executada com:

```bash
bash scripts/validate-planificacao.sh
```

Resultado executado em `2026-05-30`: `FALHOU` antes de validar os BKs, porque o wrapper procura `../scripts/validate_planificacao_canonica.py` e esse ficheiro não existe no caminho esperado a partir deste repositório.

Erro observado:

```text
can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Este bloqueio é de infraestrutura do validador e não resulta de uma inconsistência detetada nos BKs revistos da `MF1`.
