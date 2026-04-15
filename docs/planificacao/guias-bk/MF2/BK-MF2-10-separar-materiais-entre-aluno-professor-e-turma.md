# BK-MF2-10 - Separar materiais entre “aluno”, “professor” e “turma”.

## Header
- `doc_id`: `GUIA-BK-MF2-10`
- `bk_id`: `BK-MF2-10`
- `macro`: `MF2`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF34`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-11`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-10-separar-materiais-entre-aluno-professor-e-turma.md`
- `last_updated`: `2026-04-14`

## Contexto do BK
- Entrega alvo: `Separar materiais entre “aluno”, “professor” e “turma”.` com rastreabilidade direta para `RF34`.
- Foco da macro `MF2`: Nucleo funcional II.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF2-07`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `RF34` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF2-10`
- Requisito: `RF34`
- Dependencias: `BK-MF2-07`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF2-10` e do requisito `RF34`.
2. Validar pre-condicoes tecnicas e dependencias declaradas: `BK-MF2-07`.
3. Definir contrato de entrada/saida do fluxo principal antes de escrever codigo.
4. Implementar caminho principal com logs suficientes para evidencia tecnica.
5. Executar smoke test do fluxo principal e registar resultado observavel.
6. Executar pelo menos `3` cenarios negativos e validar respostas controladas.
7. Aplicar reforco tecnico no risco dominante (seguranca/performance/robustez).
8. Atualizar handoff do proximo BK com riscos, bloqueios e decisoes abertas.

### Validacao
- Smoke: minimo `1` execucao completa do fluxo principal.
- Negativos: minimo `3` cenarios com erro controlado.
- Tecnico: metadados alinhados entre matriz/backlog/guia.
- Evidence: `pr`, `proof`, `neg` preenchidos com dados reais.

### Handoff
- Proximo BK: `BK-MF2-11`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Validacao de sessao e papel**

```ts
type UtilizadorSessao = { id: string; papel: 'ALUNO' | 'PROFESSOR' | 'ADMIN' };

export function exigirSessao(u: UtilizadorSessao | null, papelNecessario: UtilizadorSessao['papel']) {
  if (!u) throw new Error('Sessao invalida');
  if (u.papel !== papelNecessario) throw new Error('Permissao insuficiente');
  return { ok: true, bk: 'BK-MF2-10', req: 'RF34' };
}
```

Aplicar no endpoint principal do BK para bloquear acessos indevidos de forma deterministica.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Validacao smoke e negativos concluida sem falha bloqueante.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo do que mudou.
- `proof`: output/screenshot/log/teste que comprova comportamento esperado.
- `neg`: evidencia dos cenarios negativos executados.

## Changelog
- `2026-04-14`: guia normalizado para contrato canónico com bloco pedagogico e operacional completos.
