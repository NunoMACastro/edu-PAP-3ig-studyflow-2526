# BK-MF3-07 - Agendar sessões de estudo coletivo.

## Header
- `doc_id`: `GUIA-BK-MF3-07`
- `bk_id`: `BK-MF3-07`
- `macro`: `MF3`
- `owner`: `Guilherme`
- `apoio`: `Guilherme`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-05`
- `rf_rnf`: `RF43`
- `fase_documental`: `Fase 2`
- `sprint`: `S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-08`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-07-agendar-sessoes-de-estudo-coletivo.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `Agendar sessões de estudo coletivo.` com rastreabilidade direta para `RF43`.
- Foco da macro `MF3`: Capacidades de produto I.
- Dominio semântico aplicado: `collaboration`.

## Bloco pedagogico
### Objetivo
Assegurar colaboracao em grupo com isolamento de membros e historico verificavel.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF3-05`.

### Erros comuns
- Expor dados de sala a não-membros.
- Não persistir histórico de sessão/co-estudo.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF43` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF3-07`
- Requisito: `RF43`
- Dependencias: `BK-MF3-05`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF3-07` e do requisito `RF43`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF3-05`.
3. Modelar contratos de dados e estados para `sala/grupo com partilha e histórico`.
4. Implementar o caminho principal de `sala/grupo com partilha e histórico`.
5. Aplicar controlos para `controlo de membros e permissões de escrita`.
6. Preparar evidencia operacional: `histórico de sessão e autoria`.
7. Executar smoke test completo do fluxo principal e registar o resultado.
8. Executar cenarios negativos obrigatorios (minimo 1) e validar erro controlado.

### Cenarios negativos recomendados
- entrada obrigatória em falta

### Validacao
- [ ] Smoke: minimo `1` execucao completa do fluxo principal.
- [ ] Negativos: minimo `1` cenarios com resultado controlado.
- [ ] Tecnico: metadados alinhados entre matriz/backlog/guia.
- [ ] Fluxo do requisito cumpre contrato de entrada/saída.
- [ ] Persistência e leitura dos dados mantêm consistência.

### Matriz minima de testes por prioridade
- `P0`: unit + integration + e2e + 3 negativos.
- `P1`: unit/integration + 2 negativos.
- `P2`: teste focal + 1 negativo.

### Handoff
- Proximo BK recomendado: `BK-MF3-08`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Controlo de acesso de sala/grupo**
- BK vinculado: `BK-MF3-07`.

```ts
type Membro = { userId: string; salaId: string; ativo: boolean };

export function validarMembro(m: Membro) {
  if (!m.ativo) throw new Error('Membro sem acesso');
  return { bkId: 'BK-MF3-07', req: 'RF43', permissao: 'OK', salaId: m.salaId };
}
```

Garante que partilha/chat só ocorre para membros ativos.
- Requisitos alvo deste BK: `RF43`.

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Cenarios negativos concluidos: minimo `1` com resultado controlado.
- Evidencia de testes por camada conforme prioridade (`P2`).
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Proximo BK recomendado
`BK-MF3-08`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
