# BK-MF7-06 - Configurar modelos de IA e limites de uso.

## Header
- `doc_id`: `GUIA-BK-MF7-06`
- `bk_id`: `BK-MF7-06`
- `macro`: `MF7`
- `owner`: `Guilherme`
- `apoio`: `Natália`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforço`: `M`
- `dependências`: `BK-MF2-05`
- `rf_rnf`: `RF57`
- `last_updated`: `2026-04-12`

## O que vamos fazer neste BK
Neste BK vamos entregar a capacidade correspondente a `RF57`: **Configurar modelos de IA e limites de uso.**. O resultado final observável é uma evidência objetiva de que o requisito foi implementado e validado conforme backlog.

Este trabalho decorre na macro `MF7` (Privacidade/admin/operação) e na `Fase 3`. Dependências atuais: BK-MF2-05; se algum detalhe técnico estiver em falta, fica **a definir no BK dependente**.

## Porque isto é importante
- Impacto funcional no produto: concretiza `RF57` e reduz lacunas no fluxo do utilizador final.
- Impacto técnico/arquitetural: consolida a base técnica da macro `MF7` com critérios verificáveis.
- Impacto na sequência de BKs: desbloqueia a continuidade para `BK-MF7-07` quando aplicável.
- Risco de execução incorreta: divergência entre backlog e entrega pode quebrar rastreabilidade e aceite do `BK-MF7-06`.

## O que entra (scope)
- Definir entrega mínima validável para `RF57` alinhada com RF/RNF.
- Implementar os artefactos necessários para cumprir o objetivo funcional/técnico deste BK.
- Validar dependências e evidenciar que pré-condições estão satisfeitas antes do handoff.
- Documentar decisão técnica e impacto no backlog, MF view e sprint.

## O que não entra (scope-out)
- Trabalho de BKs seguintes além de `BK-MF7-07`.
- Refactors estruturais fora do objetivo direto deste BK.
- Integrações sem pré-condições técnicas ou sem dependências desbloqueadas.
- Alterações de estado operacional de BK sem pedido explícito do orientador/equipa.

## Como saber que isto ficou bem
- Quando o requisito `RF57` é exercitado, então o comportamento esperado é observado sem ambiguidade.
- Quando o checklist Smoke é executado, então todas as verificações passam.
- Quando os negativos são corridos, então as proteções e limites definidos são respeitados.
- Quando o handoff ocorre, então existem proofs suficientes para auditoria do BK.

## Pre-leitura mínima (10-15 min)
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/RF.md` (RF57)
- `docs/RNF.md` (RNF transversais aplicáveis)

## Glossário rápido
- BK: unidade atómica de backlog com owner único e aceite auditável.
- Scope: limites de trabalho que entram no BK atual.
- Scope-out: exclusões explícitas para evitar scope creep.
- Handoff: transferência formal entre owner e apoio com evidence.
- Smoke: validação rápida dos fluxos principais após implementação.
- Proof: evidência factual (logs, capturas, outputs) associada ao BK.

## Guia de execução (passo-a-passo)
1. **Baseline e dependências**
   Objetivo (~10 min): confirmar contexto `BK-MF7-06` e dependências `BK-MF2-05`.
   Justificação: evita iniciar trabalho bloqueado.
   Como fazer: cruzar BACKLOG-MVP, MF-VIEWS e guia atual.
   O que verificar: dependências resolvidas ou risco documentado.
2. **Decomposição de tarefas**
   Objetivo (~15 min): partir `RF57` em tarefas executáveis curtas.
   Justificação: melhora previsibilidade e handoff.
   Como fazer: separar implementação, validação e evidence.
   O que verificar: cada tarefa é mensurável em review.
3. **Desenho da solução**
   Objetivo (~20 min): definir abordagem técnica mínima para `Configurar modelos de IA e limites de uso.`.
   Justificação: reduz retrabalho e conflitos arquiteturais.
   Como fazer: explicitar entradas, saídas e restrições do BK.
   O que verificar: desenho alinha com RF/RNF e precedência documental.
4. **Primeiro incremento**
   Objetivo (~30 min): entregar versão funcional mínima.
   Justificação: cria base validável cedo.
   Como fazer: implementar apenas o núcleo do requisito.
   O que verificar: smoke inicial passa sem regressões críticas.
5. **Fecho de casos principais**
   Objetivo (~25 min): cobrir cenários principais de uso.
   Justificação: garante valor funcional completo do BK.
   Como fazer: completar casos esperados e atualizar documentação.
   O que verificar: critérios binários de sucesso cumprem 100%.
6. **Negativos e estabilidade**
   Objetivo (~20 min): validar limites e falhas controladas.
   Justificação: evita incidentes em integração.
   Como fazer: executar pelo menos 1 negativo relevante e rever logs.
   O que verificar: comportamento de erro é previsível e seguro.
7. **Handoff e evidence**
   Objetivo (~10 min): preparar transferência e prova de execução.
   Justificação: suporta auditoria e defesa da PAP.
   Como fazer: preencher `pr`, `proof` e `neg` com evidência factual.
   O que verificar: próximo BK recomendado fica desbloqueado.

## Snippets de código (evolução)
Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto.

## Checklist de validação
### Smoke
- [ ] Fluxo principal do requisito executa sem erro bloqueante.
- [ ] Resultado observado confirma a entrega de `RF57`.

### Negativos
- [ ] Entrada inválida/restrita é rejeitada com resposta controlada.
- [ ] Tentativa fora de permissões/condições não compromete dados nem estado.

### Técnico
- [ ] Dependências do BK estão explícitas e consistentes com o backlog.
- [ ] Evidence mínima (`pr`, `proof`, `neg`) está preparada para revisão.

## Critérios de aceite
- O entregável principal de `RF57` está implementado e verificável.
- As dependências declaradas estão cumpridas ou justificadas formalmente.
- Smoke e negativos foram executados com resultado registado.
- Existe evidence auditável suficiente para PR/defesa da PAP.

## Evidence para PR/defesa
- `pr`: referência para o PR/commit associado ao BK.
- `proof`: capturas, logs ou outputs que comprovam o comportamento esperado.
- `neg`: teste negativo executado (ex.: input inválido bloqueado), com resultado observado e esperado coincidentes.

## Próximo BK recomendado
- `BK-MF7-07`
