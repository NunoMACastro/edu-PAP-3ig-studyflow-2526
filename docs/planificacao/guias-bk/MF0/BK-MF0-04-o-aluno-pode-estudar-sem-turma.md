# BK-MF0-04 - O aluno pode estudar sem turma.

## Header
- `doc_id`: `GUIA-BK-MF0-04`
- `bk_id`: `BK-MF0-04`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF04`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-05`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-04-o-aluno-pode-estudar-sem-turma.md`
- `last_updated`: `2026-04-14`

## Contexto do BK
- Entrega alvo: `O aluno pode estudar sem turma.` com rastreabilidade direta para `RF04`.
- Foco da macro `MF0`: Fundacoes de plataforma.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF0-03`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `RF04` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF0-04`
- Requisito: `RF04`
- Dependencias: `BK-MF0-03`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF0-04` e do requisito `RF04`.
2. Validar pre-condicoes tecnicas e dependencias declaradas: `BK-MF0-03`.
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
- Proximo BK: `BK-MF0-05`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Regra de notificacao contextual**

```ts
type Evento = { tipo: string; destino: 'ALUNO' | 'TURMA' | 'GRUPO'; prioridade: 'baixa' | 'media' | 'alta' };

export function gerarNotificacao(evento: Evento) {
  const urgente = evento.prioridade === 'alta';
  return {
    bk: 'BK-MF0-04',
    canal: urgente ? ['app', 'email'] : ['app'],
    mensagem: `Evento ${evento.tipo} para ${evento.destino}`,
  };
}
```

Permite validar canais/quotas de notificacao com regra objetiva e sem ambiguidade.

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
