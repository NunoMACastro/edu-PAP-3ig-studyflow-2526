# BK-MF1-12 - Professores podem enviar avisos e publicações.

## Header
- `doc_id`: `GUIA-BK-MF1-12`
- `bk_id`: `BK-MF1-12`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF24`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`
- `last_updated`: `2026-04-14`

## Contexto do BK
- Entrega alvo: `Professores podem enviar avisos e publicações.` com rastreabilidade direta para `RF24`.
- Foco da macro `MF1`: Nucleo funcional I.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-07`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `RF24` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF1-12`
- Requisito: `RF24`
- Dependencias: `BK-MF1-07`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF1-12` e do requisito `RF24`.
2. Validar pre-condicoes tecnicas e dependencias declaradas: `BK-MF1-07`.
3. Definir contrato de entrada/saida do fluxo principal antes de escrever codigo.
4. Implementar caminho principal com logs suficientes para evidencia tecnica.
5. Executar smoke test do fluxo principal e registar resultado observavel.
6. Executar pelo menos `2` cenarios negativos e validar respostas controladas.

### Validacao
- Smoke: minimo `1` execucao completa do fluxo principal.
- Negativos: minimo `2` cenarios com erro controlado.
- Tecnico: metadados alinhados entre matriz/backlog/guia.
- Evidence: `pr`, `proof`, `neg` preenchidos com dados reais.

### Handoff
- Proximo BK: `BK-MF2-01`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Validacao de sessao e papel**

```ts
type UtilizadorSessao = { id: string; papel: 'ALUNO' | 'PROFESSOR' | 'ADMIN' };

export function exigirSessao(u: UtilizadorSessao | null, papelNecessario: UtilizadorSessao['papel']) {
  if (!u) throw new Error('Sessao invalida');
  if (u.papel !== papelNecessario) throw new Error('Permissao insuficiente');
  return { ok: true, bk: 'BK-MF1-12', req: 'RF24' };
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
