# RELATORIO-CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `RELATORIO-CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/RELATORIO-CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Ficheiros criados/atualizados
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/ROADMAP-BKS-RESTANTES.md`
- `docs/planificacao/guias-bk/MF0..MF8/*.md` (106 guias)

## Resumo de cobertura
- `106/106 BK` com guia (cobertura 1:1).

## Validações obrigatórias (PASS/FAIL)
- Cobertura BK↔guia (1:1): `PASS`
- Headings obrigatórias em todos os guias: `PASS`
- Frase de snippets quando aplicável: `PASS`
- Links válidos sem quebra: `PASS`
- Sem BK duplicado: `PASS`
- Sem dependências inválidas: `PASS`
- Sem divergência backlog vs guia: `PASS`

## Inconsistências detetadas e correções
- Inconsistências iniciais na baseline: dependências RF cruzadas entre macros (`RF31 -> RF21` e `RF36 -> RF22`) que, no mapeamento escolhido, resultam em `BK-MF2-01 -> BK-MF3-03` e `BK-MF2-06 -> BK-MF3-04`.
- Correções aplicadas: normalização RF/RNF para dependências BK e introdução de gate de desbloqueio documental (MF-VIEWS/PLANO-SPRINTS) para dependências cruzadas.

## Pendências
- Sem pendências documentais na cobertura inicial. Snippets reais serão adicionados com evolução do projeto.

## Confirmações finais
- Sem links quebrados.
- Sem BK sem guia.
- Sem headings em falta.
- Sem dependências inválidas.
- Sem divergência entre backlog e guias.
