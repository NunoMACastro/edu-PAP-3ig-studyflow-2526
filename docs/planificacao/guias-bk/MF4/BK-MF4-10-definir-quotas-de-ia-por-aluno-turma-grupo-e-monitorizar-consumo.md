# BK-MF4-10 - Definir quotas de IA por aluno/turma/grupo e monitorizar consumo.

## Header
- `doc_id`: `GUIA-BK-MF4-10`
- `bk_id`: `BK-MF4-10`
- `macro`: `MF4`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-09`
- `rf_rnf`: `RF58`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-10-definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Definir quotas de IA por aluno/turma/grupo e monitorizar consumo.` com rastreabilidade direta para `RF58`.
- Foco da macro `MF4`: Capacidades de produto II.
- Dominio semântico aplicado: `admin_governance`.

## Bloco pedagogico
### Objetivo
Operacionalizar governanca administrativa de papeis, auditoria e limites de uso.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF4-09`.

### Erros comuns
- Alterar papeis sem trilho de auditoria.
- Aplicar quotas globais sem segmentar por contexto.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF58` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF4-10`
- Requisito: `RF58`
- Dependencias: `BK-MF4-09`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF4-10` e do requisito `RF58`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF4-09`.
3. Modelar contratos de dados e estados para `painel admin para papéis, auditoria e quotas`.
4. Implementar o caminho principal de `painel admin para papéis, auditoria e quotas`.
5. Aplicar controlos para `limites por aluno/turma/grupo/modelo`.
6. Preparar evidencia operacional: `alterações administrativas rastreadas`.
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
- Proximo BK recomendado: `BK-MF5-01`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Política de quotas por contexto**
- BK vinculado: `BK-MF4-10`.

```ts
type Quota = { contexto: 'ALUNO' | 'TURMA' | 'GRUPO'; limiteMensal: number };

export function validarQuota(q: Quota, consumoAtual: number) {
  if (q.limiteMensal <= 0) throw new Error('Limite invalido');
  return { bkId: 'BK-MF4-10', req: 'RF58', excedido: consumoAtual >= q.limiteMensal };
}
```

Permite governança operacional de consumo de IA.
- Requisitos alvo deste BK: `RF58`.

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
`BK-MF5-01`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
