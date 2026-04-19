# BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.

## Header
- `doc_id`: `GUIA-BK-MF1-11`
- `bk_id`: `BK-MF1-11`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF23`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-12`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `O aluno inscrito numa turma recebe versão limitada da IA.` com rastreabilidade direta para `RF23`.
- Foco da macro `MF1`: Nucleo funcional I.
- Dominio semântico aplicado: `classroom_teacher`.

## Bloco pedagogico
### Objetivo
Implementar operacao professor/turma/disciplina com controlo de acesso e curadoria oficial.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF1-10`.

### Erros comuns
- Permitir acesso a disciplina sem inscricao.
- Publicar material oficial sem revisão de permissões.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF23` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF1-11`
- Requisito: `RF23`
- Dependencias: `BK-MF1-10`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF1-11` e do requisito `RF23`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF1-10`.
3. Modelar contratos de dados e estados para `fluxo turma/disciplina/material oficial`.
4. Implementar o caminho principal de `fluxo turma/disciplina/material oficial`.
5. Aplicar controlos para `autorização por inscrição e papel docente`.
6. Preparar evidencia operacional: `evidência de acesso autorizado/negado`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 3) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio
- permissão insuficiente

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF1-12`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Autorização por turma e disciplina**
- BK vinculado: `BK-MF1-11`.

```ts
type Contexto = { turmaId: string; disciplinaId: string; papel: 'ALUNO' | 'PROFESSOR' };

export function autorizarContexto(c: Contexto) {
  if (!c.turmaId || !c.disciplinaId) throw new Error('Contexto incompleto');
  if (c.papel !== 'PROFESSOR') throw new Error('Apenas docente pode executar esta ação');
  return { bkId: 'BK-MF1-11', req: 'RF23', autorizado: true };
}
```

Evita operações docentes fora do contexto da turma/disciplina.
- Requisitos alvo deste BK: `RF23`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `3` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P0`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF1-12`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
