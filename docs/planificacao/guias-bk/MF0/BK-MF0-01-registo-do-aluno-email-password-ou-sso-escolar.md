# BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).

## Header
- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF01`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Registo do aluno (email/password ou SSO escolar).` com rastreabilidade direta para `RF01`.
- Foco da macro `MF0`: Fundacoes de plataforma.
- Dominio semântico aplicado: `security_hardening`.

## Bloco pedagogico
### Objetivo
Endurecer superficie de seguranca com protecoes ativas e validacao negativa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `-`.

### Erros comuns
- Depender de segurança apenas no frontend.
- Não testar vetores negativos (XSS/CSRF/brute-force).
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF01` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `+20-40 min`

## Bloco operacional
### Entrada
- BK: `BK-MF0-01`
- Requisito: `RF01`
- Dependencias: `-`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF0-01` e do requisito `RF01`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `-`.
3. Modelar contratos de dados e estados para `proteções de canal/sessão/entrada`.
4. Implementar o caminho principal de `proteções de canal/sessão/entrada`.
5. Aplicar controlos para `mitigações XSS/CSRF/injection/brute-force`.
6. Preparar evidencia operacional: `evidência de bloqueio em testes negativos`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar negativos obrigatórios (`3`) e validar erro controlado.
9. Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).
10. Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.

### Cenarios negativos recomendados
- pedido HTTP sem TLS
- payload com tentativa de injection
- token/cookie inválido

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `3` cenários com erro controlado.
- Endpoint crítico recusa tráfego inseguro.
- Vetores negativos conhecidos geram erro controlado.
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `BK-MF0-02`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Middlewares de segurança obrigatórios**

```ts
export function exigirHTTPS(proto: string) {
  if (proto !== 'https') throw new Error('Canal inseguro');
}

export function validarRateLimit(tentativasMinuto: number, limite: number) {
  if (tentativasMinuto > limite) throw new Error('Rate limit excedido');
  return { bkId: 'BK-MF0-01', req: 'RF01', ok: true };
}
```

Aplica proteção ativa no perímetro do endpoint crítico.

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
