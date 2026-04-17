# BK-MF2-04 - Criar testes/mini-testes oficiais.

## Header
- `doc_id`: `GUIA-BK-MF2-04`
- `bk_id`: `BK-MF2-04`
- `macro`: `MF2`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-08`
- `rf_rnf`: `RF28`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-05`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-04-criar-testes-mini-testes-oficiais.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Criar testes/mini-testes oficiais.` com rastreabilidade direta para `RF28`.
- Foco da macro `MF2`: Nucleo funcional II.
- Dominio semântico aplicado: `projects_assessment`.

## Bloco pedagogico
### Objetivo
Implementar ciclo de projetos e testes com criterios de avaliacao reproduziveis.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-08`.

### Erros comuns
- Gerar testes sem chave de correção consistente.
- Registar progresso sem granularidade por tópico.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF28` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF2-04`
- Requisito: `RF28`
- Dependencias: `BK-MF1-08`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF2-04` e do requisito `RF28`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF1-08`.
3. Modelar contratos de dados e estados para `criação de projeto/teste e avaliação`.
4. Implementar o caminho principal de `criação de projeto/teste e avaliação`.
5. Aplicar controlos para `rubrica de correção e persistência de desempenho`.
6. Preparar evidencia operacional: `resultados por tópico e turma`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar negativos obrigatórios (`3`) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio
- permissão insuficiente

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `3` cenários com erro controlado.
- Fluxo do requisito cumpre contrato de entrada/saída.
- Persistência e leitura dos dados mantêm consistência.
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `BK-MF2-05`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Correção de mini-teste com rubrica**

```ts
type Resposta = { topico: string; correta: boolean };

export function calcularDesempenho(respostas: Resposta[]) {
  if (!respostas.length) throw new Error('Sem respostas para avaliar');
  const corretas = respostas.filter((r) => r.correta).length;
  return { bkId: 'BK-MF2-04', req: 'RF28', score: Math.round((corretas / respostas.length) * 100) };
}
```

Produz saída objetiva por tópico para acompanhamento docente.

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
