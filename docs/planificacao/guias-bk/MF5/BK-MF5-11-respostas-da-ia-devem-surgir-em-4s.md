# BK-MF5-11 - Respostas da IA devem surgir em ≤ 4s.

## Header
- `doc_id`: `GUIA-BK-MF5-11`
- `bk_id`: `BK-MF5-11`
- `macro`: `MF5`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF09`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-12`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-11-respostas-da-ia-devem-surgir-em-4s.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Respostas da IA devem surgir em ≤ 4s.` com rastreabilidade direta para `RNF09`.
- Foco da macro `MF5`: Operacao e UX transversal.
- Dominio semântico aplicado: `performance_scalability`.

## Bloco pedagogico
### Objetivo
Cumprir metas de latencia e escalabilidade com instrumentacao objetiva.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Medir latencia sem cenário reproduzível.
- Bloquear UI em tarefas assíncronas pesadas.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RNF09` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF5-11`
- Requisito: `RNF09`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF5-11` e do requisito `RNF09`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `cenário de carga e medição de latência`.
4. Implementar o caminho principal de `cenário de carga e medição de latência`.
5. Aplicar controlos para `timeouts, filas e controlo de concorrência`.
6. Preparar evidencia operacional: `métricas comparáveis pré/pós`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar negativos obrigatórios (`2`) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `2` cenários com erro controlado.
- Métrica alvo do BK é medida e comparável.
- Caminho crítico mantém-se dentro do orçamento definido.
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `BK-MF5-12`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Consulta de latência por janela**

```sql
-- BK: BK-MF5-11 / RNF09
SELECT DATE_TRUNC('minute', created_at) AS janela,
       AVG(latencia_ms) AS lat_media,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latencia_ms) AS p95
FROM metricas_latency
WHERE contexto = :contexto
GROUP BY 1
ORDER BY 1 DESC
LIMIT 60;
```

Base para validar SLA do caminho crítico com p95 mensurável.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Validacao smoke e negativos concluida sem falha bloqueante.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Changelog
- `2026-04-17`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
