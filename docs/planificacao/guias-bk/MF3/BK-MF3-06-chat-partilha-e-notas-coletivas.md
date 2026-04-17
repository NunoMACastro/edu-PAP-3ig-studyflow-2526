# BK-MF3-06 - Chat, partilha e notas coletivas.

## Header
- `doc_id`: `GUIA-BK-MF3-06`
- `bk_id`: `BK-MF3-06`
- `macro`: `MF3`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-05`
- `rf_rnf`: `RF42`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-07`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-06-chat-partilha-e-notas-coletivas.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: `Chat, partilha e notas coletivas.` com rastreabilidade direta para `RF42`.
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
- [ ] Sei explicar como `RF42` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF3-06`
- Requisito: `RF42`
- Dependencias: `BK-MF3-05`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF3-06` e do requisito `RF42`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF3-05`.
3. Modelar contratos de dados e estados para `sala/grupo com partilha e histórico`.
4. Implementar o caminho principal de `sala/grupo com partilha e histórico`.
5. Aplicar controlos para `controlo de membros e permissões de escrita`.
6. Preparar evidencia operacional: `histórico de sessão e autoria`.
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
- Proximo BK: `BK-MF3-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Controlo de acesso de sala/grupo**

```ts
type Membro = { userId: string; salaId: string; ativo: boolean };

export function validarMembro(m: Membro) {
  if (!m.ativo) throw new Error('Membro sem acesso');
  return { bkId: 'BK-MF3-06', req: 'RF42', permissao: 'OK', salaId: m.salaId };
}
```

Garante que partilha/chat só ocorre para membros ativos.

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
