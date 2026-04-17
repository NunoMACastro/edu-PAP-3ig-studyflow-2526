# BK-MF4-05 - Eliminar conta e dados.

## Header
- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF53`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-eliminar-conta-e-dados.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Eliminar conta e dados.` com rastreabilidade direta para `RF53`.
- Foco da macro `MF4`: Capacidades de produto II.
- Dominio semântico aplicado: `privacy_rgpd`.

## Bloco pedagogico
### Objetivo
Cumprir direitos RGPD (exportacao, eliminacao, consentimento) com trilho auditavel.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Não registar prova de consentimento.
- Eliminar dados sem política de retenção definida.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF53` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF4-05`
- Requisito: `RF53`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF4-05` e do requisito `RF53`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `exportação/eliminação/consentimento com estado auditável`.
4. Implementar o caminho principal de `exportação/eliminação/consentimento com estado auditável`.
5. Aplicar controlos para `política de retenção e trilho de prova`.
6. Preparar evidencia operacional: `registo de pedido + execução`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar negativos obrigatórios (`3`) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- exportação sem autenticação forte
- eliminação sem confirmação de titular
- consentimento retirado em uso ativo

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `3` cenários com erro controlado.
- Pedido RGPD deixa trilho auditável com timestamp.
- Exportação/eliminação trata dados relacionais sem fuga.
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `BK-MF4-06`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Registo de consentimento versionado**

```ts
type Consentimento = { userId: string; finalidade: string; aceite: boolean; versao: string };

export function registarConsentimento(c: Consentimento) {
  if (!c.versao) throw new Error('Versao obrigatoria');
  return { bkId: 'BK-MF4-05', req: 'RF53', evento: 'CONSENTIMENTO_REGISTADO', consentimento: c };
}
```

Cria trilho auditável obrigatório para RGPD.

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
