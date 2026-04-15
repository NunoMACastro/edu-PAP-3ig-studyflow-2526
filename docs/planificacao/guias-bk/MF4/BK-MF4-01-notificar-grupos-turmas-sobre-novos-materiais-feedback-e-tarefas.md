# BK-MF4-01 - Notificar grupos/turmas sobre novos materiais, feedback e tarefas.

## Header
- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-12`
- `rf_rnf`: `RF49`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas.md`
- `last_updated`: `2026-04-14`

## Contexto do BK
- Entrega alvo: `Notificar grupos/turmas sobre novos materiais, feedback e tarefas.` com rastreabilidade direta para `RF49`.
- Foco da macro `MF4`: Capacidades de produto II.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-12`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `RF49` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF4-01`
- Requisito: `RF49`
- Dependencias: `BK-MF1-12`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF4-01` e do requisito `RF49`.
2. Validar pre-condicoes tecnicas e dependencias declaradas: `BK-MF1-12`.
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
- Proximo BK: `BK-MF4-02`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Pipeline minimo para resposta de IA com fontes**

```ts
type TrechoFonte = { docId: string; pagina: number; texto: string };

export function responderComFonte(pergunta: string, contexto: TrechoFonte[]) {
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!contexto.length) throw new Error('Sem contexto para responder');

  const base = contexto.slice(0, 3).map((t) => `[${t.docId}:${t.pagina}]`).join(' ');
  return {
    bkId: 'BK-MF4-01',
    resposta: `Resposta gerada com base em ${base}`,
    fontes: contexto.slice(0, 3),
  };
}
```

Garante rastreabilidade da resposta IA ao material carregado e facilita validacao em defesa.

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
