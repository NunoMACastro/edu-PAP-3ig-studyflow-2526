# BK-MF3-01 - Guardrails distintos para aluno solo, grupo e turma.

## Header
- `doc_id`: `GUIA-BK-MF3-01`
- `bk_id`: `BK-MF3-01`
- `macro`: `MF3`
- `owner`: `Natalia`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF37`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-02`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-01-guardrails-distintos-para-aluno-solo-grupo-e-turma.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Guardrails distintos para aluno solo, grupo e turma.` com rastreabilidade direta para `RF37`.
- Foco da macro `MF3`: Capacidades de produto I.
- Dominio semântico aplicado: `collaboration`.

## Bloco pedagogico
### Objetivo
Assegurar colaboracao em grupo com isolamento de membros e historico verificavel.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF2-11`.

### Erros comuns
- Expor dados de sala a não-membros.
- Não persistir histórico de sessão/co-estudo.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF37` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF3-01`
- Requisito: `RF37`
- Dependencias: `BK-MF2-11`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF3-01` e do requisito `RF37`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF2-11`.
3. Modelar contratos de dados e estados para `sala/grupo com partilha e histórico`.
4. Implementar o caminho principal de `sala/grupo com partilha e histórico`.
5. Aplicar controlos para `controlo de membros e permissões de escrita`.
6. Preparar evidencia operacional: `histórico de sessão e autoria`.
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
- Proximo BK recomendado: `BK-MF3-02`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Controlo de acesso de sala/grupo**
- BK vinculado: `BK-MF3-01`.

```ts
type Membro = { userId: string; salaId: string; ativo: boolean };

export function validarMembro(m: Membro) {
  if (!m.ativo) throw new Error('Membro sem acesso');
  return { bkId: 'BK-MF3-01', req: 'RF37', permissao: 'OK', salaId: m.salaId };
}
```

Garante que partilha/chat só ocorre para membros ativos.
- Requisitos alvo deste BK: `RF37`.

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
`BK-MF3-02`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
