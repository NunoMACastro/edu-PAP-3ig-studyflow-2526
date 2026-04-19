# BK-MF3-03 - IA pode recorrer a conhecimento externo (limitado) quando permitido.

## Header
- `doc_id`: `GUIA-BK-MF3-03`
- `bk_id`: `BK-MF3-03`
- `macro`: `MF3`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF39`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-04`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-03-ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `IA pode recorrer a conhecimento externo (limitado) quando permitido.` com rastreabilidade direta para `RF39`.
- Foco da macro `MF3`: Capacidades de produto I.
- Dominio semântico aplicado: `ai_orchestration`.

## Bloco pedagogico
### Objetivo
Garantir respostas de IA fundamentadas, com guardrails e adaptacao ao contexto academico correto.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF2-11`.

### Erros comuns
- Responder sem citar fonte do material.
- Aplicar perfil de IA errado ao contexto atual.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF39` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF3-03`
- Requisito: `RF39`
- Dependencias: `BK-MF2-11`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF3-03` e do requisito `RF39`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF2-11`.
3. Modelar contratos de dados e estados para `pipeline IA com contexto e fontes citadas`.
4. Implementar o caminho principal de `pipeline IA com contexto e fontes citadas`.
5. Aplicar controlos para `guardrails por perfil (aluno, turma, professor)`.
6. Preparar evidencia operacional: `amostras de prompts/respostas com fontes`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- pedido sem contexto documental
- pedido que tenta contornar guardrails

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Resposta referencia fontes reais (doc/página/secção).
- [ ] Perfil de IA aplicado corresponde ao contexto do pedido.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF3-04`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Resposta IA com guardrails e fontes**
- BK vinculado: `BK-MF3-03`.

```ts
type Fonte = { doc: string; secao: string };

export function responderIA(perfil: 'ALUNO' | 'TURMA' | 'PROFESSOR', pergunta: string, fontes: Fonte[]) {
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!fontes.length) throw new Error('Resposta sem fonte permitida');
  return { bkId: 'BK-MF3-03', req: 'RF39', perfil, resposta: 'Gerada com base documental', fontes };
}
```

Força citação de fonte e aplica perfil de guardrail por contexto.
- Requisitos alvo deste BK: `RF39`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `2` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P1`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF3-04`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
