# BK-MF0-06 - O aluno pode consultar histórico de estudo.

## Header
- `doc_id`: `GUIA-BK-MF0-06`
- `bk_id`: `BK-MF0-06`
- `macro`: `MF0`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF06`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-07`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: `O aluno pode consultar histórico de estudo.` com rastreabilidade direta para `RF06`.
- Foco da macro `MF0`: Fundacoes de plataforma.
- Dominio semântico aplicado: `learning_foundation`.

## Bloco pedagogico
### Objetivo
Construir o fluxo base de aluno (identidade, perfil e estudo individual) com comportamento previsivel.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `BK-MF0-03`.

### Erros comuns
- Nao validar duplicados de conta/perfil.
- Misturar regras de aluno sem turma com turma inscrita.
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `RF06` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `n/a`

## Bloco operacional
### Entrada
- BK: `BK-MF0-06`
- Requisito: `RF06`
- Dependencias: `BK-MF0-03`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no backlog e na matriz o escopo de `BK-MF0-06` e do requisito `RF06`.
2. Validar pre-condicoes técnicas e dependencias declaradas: `BK-MF0-03`.
3. Modelar contratos de dados e estados para `fluxo de conta/perfil em estado consistente`.
4. Implementar o caminho principal de `fluxo de conta/perfil em estado consistente`.
5. Aplicar controlos para `regras de sessão/papel e transições de estado`.
6. Preparar evidencia operacional: `mapa de estados (novo, ativo, bloqueado)`.
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
- Proximo BK recomendado: `BK-MF0-07`
- Registar bloqueios, decisão técnica e risco residual.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**Handler de registo e sessão**
- BK vinculado: `BK-MF0-06`.

```ts
type Credenciais = { email: string; password: string };

export async function registarAluno(input: Credenciais) {
  if (!input.email.includes('@')) throw new Error('Email invalido');
  if (input.password.length < 12) throw new Error('Password fraca');
  return { bkId: 'BK-MF0-06', req: 'RF06', estado: 'REGISTADO' };
}
```

Garante validação mínima de identidade no arranque do fluxo de conta.
- Requisitos alvo deste BK: `RF06`.

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
`BK-MF0-07`

## Changelog
- `2026-04-19`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
