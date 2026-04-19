# BK-MF2-06 - Painel com progresso, dificuldades e métricas da turma.

## Header
- `doc_id`: `GUIA-BK-MF2-06`
- `bk_id`: `BK-MF2-06`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-12`
- `rf_rnf`: `RF30`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-07`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-06-painel-com-progresso-dificuldades-e-metricas-da-turma.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Painel com progresso, dificuldades e métricas da turma.` com rastreabilidade direta para `RF30`.
- Foco da macro `MF2`: Nucleo funcional II.
- Dominio semântico aplicado: `projects_assessment`.

## Bloco pedagogico
### Objetivo
Implementar ciclo de projetos e testes com criterios de avaliacao reproduziveis.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-12`.

### Erros comuns
- Gerar testes sem chave de correção consistente.
- Registar progresso sem granularidade por tópico.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF30` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF2-06`
- Requisito: `RF30`
- Dependencias: `BK-MF1-12`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF2-06` e do requisito `RF30`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF1-12`.
3. Modelar contratos de dados e estados para `criação de projeto/teste e avaliação`.
4. Implementar o caminho principal de `criação de projeto/teste e avaliação`.
5. Aplicar controlos para `rubrica de correção e persistência de desempenho`.
6. Preparar evidencia operacional: `resultados por tópico e turma`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 2) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF2-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Correção de mini-teste com rubrica**
- BK vinculado: `BK-MF2-06`.

```ts
type Resposta = { topico: string; correta: boolean };

export function calcularDesempenho(respostas: Resposta[]) {
  if (!respostas.length) throw new Error('Sem respostas para avaliar');
  const corretas = respostas.filter((r) => r.correta).length;
  return { bkId: 'BK-MF2-06', req: 'RF30', score: Math.round((corretas / respostas.length) * 100) };
}
```

Produz saída objetiva por tópico para acompanhamento docente.
- Requisitos alvo deste BK: `RF30`.

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
`BK-MF2-07`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
