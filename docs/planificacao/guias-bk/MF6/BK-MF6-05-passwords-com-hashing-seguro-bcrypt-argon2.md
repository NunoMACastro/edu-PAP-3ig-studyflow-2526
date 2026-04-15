# BK-MF6-05 - Passwords com hashing seguro (bcrypt/argon2).

## Header
- `doc_id`: `GUIA-BK-MF6-05`
- `bk_id`: `BK-MF6-05`
- `macro`: `MF6`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF15`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-06`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-05-passwords-com-hashing-seguro-bcrypt-argon2.md`
- `last_updated`: `2026-04-14`

## Contexto do BK
- Entrega alvo: `Passwords com hashing seguro (bcrypt/argon2).` com rastreabilidade direta para `RNF15`.
- Foco da macro `MF6`: Qualidade, seguranca e performance.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `RNF15` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF6-05`
- Requisito: `RNF15`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF6-05` e do requisito `RNF15`.
2. Validar pre-condicoes tecnicas e dependencias declaradas: `-`.
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
- Proximo BK: `BK-MF6-06`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Validacao de sessao e papel**

```ts
type UtilizadorSessao = { id: string; papel: 'ALUNO' | 'PROFESSOR' | 'ADMIN' };

export function exigirSessao(u: UtilizadorSessao | null, papelNecessario: UtilizadorSessao['papel']) {
  if (!u) throw new Error('Sessao invalida');
  if (u.papel !== papelNecessario) throw new Error('Permissao insuficiente');
  return { ok: true, bk: 'BK-MF6-05', req: 'RNF15' };
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
