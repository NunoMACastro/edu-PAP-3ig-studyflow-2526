# BK-MF2-17 - IA evita enviesamentos e respostas inseguras.

## Header
- `doc_id`: `GUIA-BK-MF2-17`
- `bk_id`: `BK-MF2-17`
- `macro`: `MF2`
- `owner`: `Natália`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforço`: `L`
- `dependências`: `-`
- `rf_rnf`: `RNF34`
- `last_updated`: `2026-04-12`

## O que vamos fazer neste BK
Neste BK vamos entregar a capacidade correspondente a `RNF34`: **IA evita enviesamentos e respostas inseguras.**. O resultado final observável é uma evidência objetiva de que o requisito foi implementado e validado conforme backlog.

Este trabalho decorre na macro `MF2` (Conhecimento + IA core) e na `Fase 1`. Dependências atuais: -; se algum detalhe técnico estiver em falta, fica **a definir no BK dependente**.

## Porque isto é importante
- Impacto funcional no produto: concretiza `RNF34` e reduz lacunas no fluxo do utilizador final.
- Impacto técnico/arquitetural: consolida a base técnica da macro `MF2` com critérios verificáveis.
- Impacto na sequência de BKs: desbloqueia a continuidade para `BK-MF2-18` quando aplicável.
- Risco de execução incorreta: divergência entre backlog e entrega pode quebrar rastreabilidade e aceite do `BK-MF2-17`.

## O que entra (scope)
- Definir entrega mínima validável para `RNF34` alinhada com RF/RNF.
- Implementar os artefactos necessários para cumprir o objetivo funcional/técnico deste BK.
- Validar dependências e evidenciar que pré-condições estão satisfeitas antes do handoff.
- Documentar decisão técnica e impacto no backlog, MF view e sprint.

## O que não entra (scope-out)
- Trabalho de BKs seguintes além de `BK-MF2-18`.
- Refactors estruturais fora do objetivo direto deste BK.
- Integrações sem pré-condições técnicas ou sem dependências desbloqueadas.
- Alterações de estado operacional de BK sem pedido explícito do orientador/equipa.

## Como saber que isto ficou bem
- Quando o requisito `RNF34` é exercitado, então o comportamento esperado é observado sem ambiguidade.
- Quando o checklist Smoke é executado, então todas as verificações passam.
- Quando os negativos são corridos, então as proteções e limites definidos são respeitados.
- Quando o handoff ocorre, então existem proofs suficientes para auditoria do BK.

## Pre-leitura mínima (10-15 min)
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/RNF.md` (RNF34)
- `docs/RF.md` (RF impactados pela não funcionalidade)

## Glossário rápido
- BK: unidade atómica de backlog com owner único e aceite auditável.
- Scope: limites de trabalho que entram no BK atual.
- Scope-out: exclusões explícitas para evitar scope creep.
- Handoff: transferência formal entre owner e apoio com evidence.
- Smoke: validação rápida dos fluxos principais após implementação.
- Proof: evidência factual (logs, capturas, outputs) associada ao BK.

## Guia de execução (passo-a-passo)
1. **Baseline e dependências**
   Objetivo (~10 min): confirmar contexto `BK-MF2-17` e dependências `-`.
   Justificação: evita iniciar trabalho bloqueado.
   Como fazer: cruzar BACKLOG-MVP, MF-VIEWS e guia atual.
   O que verificar: dependências resolvidas ou risco documentado.
2. **Decomposição de tarefas**
   Objetivo (~15 min): partir `RNF34` em tarefas executáveis curtas.
   Justificação: melhora previsibilidade e handoff.
   Como fazer: separar implementação, validação e evidence.
   O que verificar: cada tarefa é mensurável em review.
3. **Desenho da solução**
   Objetivo (~20 min): definir abordagem técnica mínima para `IA evita enviesamentos e respostas inseguras.`.
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
- [ ] Resultado observado confirma a entrega de `RNF34`.

### Negativos
- [ ] Entrada inválida/restrita é rejeitada com resposta controlada.
- [ ] Tentativa fora de permissões/condições não compromete dados nem estado.

### Técnico
- [ ] Dependências do BK estão explícitas e consistentes com o backlog.
- [ ] Evidence mínima (`pr`, `proof`, `neg`) está preparada para revisão.

## Critérios de aceite
- O entregável principal de `RNF34` está implementado e verificável.
- As dependências declaradas estão cumpridas ou justificadas formalmente.
- Smoke e negativos foram executados com resultado registado.
- Existe evidence auditável suficiente para PR/defesa da PAP.

## Evidence para PR/defesa
- `pr`: referência para o PR/commit associado ao BK.
- `proof`: capturas, logs ou outputs que comprovam o comportamento esperado.
- `neg`: teste negativo executado (ex.: input inválido bloqueado), com resultado observado e esperado coincidentes.

## Próximo BK recomendado
- `BK-MF2-18`
