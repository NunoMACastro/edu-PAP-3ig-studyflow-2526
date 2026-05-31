# Auditoria e correção de hidratação - MF1

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `macro`: `MF1`
- `modo`: `corrigir_apenas`
- `status`: `corrigido`
- `data`: `2026-05-31`
- `escopo`: apenas BKs da MF1 classificados como `PARCIAL` na auditoria anterior

## Resultado

Foram analisados 10 BKs da MF1 e corrigidos os 10 BKs classificados como `PARCIAL`.

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| OK | 0 | 10 |
| PARCIAL | 10 | 0 |
| CRÍTICO | 0 | 0 |

## BKs editados

| BK | Estado antes | Estado depois | Correção aplicada |
| --- | --- | --- | --- |
| `BK-MF1-01` | PARCIAL | OK | Corrigidos `Expected results` para `/learning-profile` e `/adaptive-explanations`; página adaptativa passou a declarar carregamento, vazio inicial, sucesso e erro. |
| `BK-MF1-02` | PARCIAL | OK | Página de salas passou a declarar carregamento, lista vazia, sucesso de criação/convite e erro; `Expected results` passou a exigir estes estados. |
| `BK-MF1-03` | PARCIAL | OK | Página de partilhas passou a declarar carregamento, lista vazia, sucesso de criação e erro; validação operacional passou a cobrir passos e cenários negativos. |
| `BK-MF1-04` | PARCIAL | OK | Página da IA da sala passou a declarar vazio inicial, carregamento, sucesso e erro; `Expected results` passou a cobrir estes estados. |
| `BK-MF1-07` | PARCIAL | OK | Páginas de professor/aluno passaram a declarar carregamento, vazio, sucesso docente e erro; validação passou a cobrir estes estados. |
| `BK-MF1-08` | PARCIAL | OK | Página de disciplinas passou a declarar carregamento, vazio, sucesso de criação e erro; validação passou a cobrir estes estados. |
| `BK-MF1-09` | PARCIAL | OK | Página de materiais oficiais passou a declarar carregamento, vazio, sucesso de gravação e erro; validação passou a cobrir estes estados. |
| `BK-MF1-10` | PARCIAL | OK | Página da voz docente passou a declarar carregamento, vazio inicial, sucesso de gravação e erro; validação passou a cobrir estes estados. |
| `BK-MF1-11` | PARCIAL | OK | Página da IA limitada da turma passou a declarar vazio inicial, carregamento, sucesso e erro; validação passou a cobrir estes estados. |
| `BK-MF1-12` | PARCIAL | OK | Página docente e página do aluno passaram a declarar carregamento, vazio, sucesso/erro conforme o papel; `StudentClassPostsPage.tsx` foi corrigido de `VALIDAR` para `CRIAR`. |

## Lacunas corrigidas

- Contrato HTTP divergente em `BK-MF1-01`: os resultados esperados agora usam as mesmas rotas definidas pelo controller e pelo cliente frontend.
- Estados frontend ausentes: os BKs corrigidos passaram a declarar estados de carregamento, vazio, sucesso e erro diretamente no código final previsto e nos resultados esperados.
- Passo incorreto em `BK-MF1-12`: a página do aluno deixou de ser tratada como ficheiro apenas a validar e passou a ser marcada como ficheiro a criar.
- Validação de comportamento: cada BK editado passou a incluir validação operacional por passo e cenários negativos específicos, além dos estados de UI e cenários HTTP.

## Decisões técnicas confirmadas

- O ownership continua a vir da sessão autenticada, nunca de IDs livres enviados no body.
- Todas as chamadas frontend mantêm `credentials: "include"` para transportar a sessão HttpOnly.
- `BK-MF1-02` mantém `disciplineName` como etiqueta textual, porque a entidade oficial de disciplinas só nasce em `BK-MF1-08`.
- `BK-MF1-04` mantém a dependência canónica em `BK-MF1-02`, mas documenta a dependência técnica em `BK-MF1-03` para fontes `RoomShare.usableByAi`.
- `BK-MF1-09` mantém apenas materiais oficiais `PROCESSED` como fonte para `BK-MF1-11`.

## Drift documental mantido

Estes pontos foram mantidos por serem metadata ou decisões canónicas fora do escopo de `corrigir_apenas`:

- `BK-MF1-02`: sprint no guia permanece `S02`, apesar de a leitura contratual anterior indicar divergência com `S03`.
- `BK-MF1-04`: header mantém dependência canónica em `BK-MF1-02`; a dependência técnica em `BK-MF1-03` permanece documentada no corpo do guia.
- `BK-MF1-09`: owner no guia permanece `Kaua`, sem alterar metadata canónica.

## Validações executadas

```bash
rg -n 'hidrata|pós-auditoria|scaffold|roteiro genérico|conversa interna|este guia deixa de ser|código ainda não corrigido|snippet|exemplo simplificado|implementar depois|quando aplicável|helpers chamados|substitu(ir|i)r? mocks|pseudo-código|solução parcial|payload: unknown|as any|ContextAction|contextApi' docs/planificacao/guias-bk/MF1/*.md
```

Resultado: passou. O comando terminou com exit code `1`, esperado para `rg` sem ocorrências.

```bash
rg -n '/adaptive-learning/(profile|explanations)|VALIDAR: `apps/web/src/pages/student/StudentClassPostsPage.tsx`' docs/planificacao/guias-bk/MF1/*.md
```

Resultado: passou. O comando terminou com exit code `1`, esperado para `rg` sem ocorrências.

```bash
git diff --check
```

Resultado: passou.

```bash
bash scripts/validate-planificacao.sh
```

Resultado: bloqueado por erro externo ao conteúdo corrigido.

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/studyflow/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

## Estado final

A MF1 fica classificada como `OK` para os 10 BKs analisados neste ciclo de correção. O único bloqueio remanescente é operacional: `scripts/validate-planificacao.sh` referencia `../scripts/validate_planificacao_canonica.py`, que não existe no caminho esperado.
