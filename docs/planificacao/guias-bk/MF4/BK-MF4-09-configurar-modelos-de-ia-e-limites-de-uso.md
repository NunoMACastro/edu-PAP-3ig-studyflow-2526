# BK-MF4-09 - Configurar modelos de IA e limites de uso.

## Header
- `doc_id`: `GUIA-BK-MF4-09`
- `bk_id`: `BK-MF4-09`
- `macro`: `MF4`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-11`
- `rf_rnf`: `RF57`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-10`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-09-configurar-modelos-de-ia-e-limites-de-uso.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Configurar modelos de IA e limites de uso.` com rastreabilidade direta para `RF57`.
- Foco da macro `MF4`: Capacidades de produto II.
- Dominio semântico aplicado: `admin_governance`.

## Bloco pedagogico
### Objetivo
Operacionalizar governanca administrativa de papeis, auditoria e limites de uso.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF2-11`.

### Erros comuns
- Alterar papeis sem trilho de auditoria.
- Aplicar quotas globais sem segmentar por contexto.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF57` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF4-09`
- Requisito: `RF57`
- Dependencias: `BK-MF2-11`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF4-09` e do requisito `RF57`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF2-11`.
3. Modelar contratos de dados e estados para `painel admin para papéis, auditoria e quotas`.
4. Implementar o caminho principal de `painel admin para papéis, auditoria e quotas`.
5. Aplicar controlos para `limites por aluno/turma/grupo/modelo`.
6. Preparar evidencia operacional: `alterações administrativas rastreadas`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar negativos obrigatórios (`2`) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta
- estado inválido de negócio

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `2` cenários com erro controlado.
- Fluxo do requisito cumpre contrato de entrada/saída.
- Persistência e leitura dos dados mantêm consistência.
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `BK-MF4-10`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Política de quotas por contexto**

```ts
type Quota = { contexto: 'ALUNO' | 'TURMA' | 'GRUPO'; limiteMensal: number };

export function validarQuota(q: Quota, consumoAtual: number) {
  if (q.limiteMensal <= 0) throw new Error('Limite invalido');
  return { bkId: 'BK-MF4-09', req: 'RF57', excedido: consumoAtual >= q.limiteMensal };
}
```

Permite governança operacional de consumo de IA.

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
