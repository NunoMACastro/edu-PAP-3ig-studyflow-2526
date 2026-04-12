# DISTRIBUICAO-RESPONSABILIDADES

## Header
- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Equipa e carga alvo semanal
| Pessoa | Papel principal | Capacidade alvo (h/semana) | Tipo de BK prioritário |
| --- | --- | --- | --- |
| Natália | Arquitetura e execução crítica | 16 | P0 (núcleo e risco alto) |
| Guilherme | Backend/core e integração | 14 | P0/P1 |
| Kaua | Implementação funcional e suporte | 10 | P1/P2 |
| Daniel | Gestão operacional, QA documental e suporte técnico | 8 | P2 + governance |

## Regras principais
1. Owner único por BK; apoio obrigatório para handoff.
2. Daniel coordena cerimónias e checklist de conformidade documental.
3. BK só fecha quando cumprir critérios de aceite e evidence (pr/proof/neg).
4. Replaneamento semanal preserva precedência RF/RNF e dependências BK.

## Matriz por área
| Área | Responsável primário | Secundário |
| --- | --- | --- |
| Fundamentos/governance | Guilherme | Daniel |
| IA core/segurança | Natália | Guilherme |
| Turmas/professor/projetos | Guilherme | Kaua |
| Colaboração/comunidade | Natália | Kaua |
| Operação/admin/privacidade | Natália | Daniel |
| Planeamento/sprints/QA documental | Daniel | Kaua |

## Matriz por artefacto
| Artefacto | Owner | Apoio |
| --- | --- | --- |
| `PLANO-IMPLEMENTACAO-TOTAL.md` | Nuno | Daniel |
| `BACKLOG-MVP.md` | Daniel | Guilherme |
| `MF-VIEWS.md` | Guilherme | Daniel |
| `PLANO-SPRINTS.md` | Daniel | Nuno |
| `guias-bk/MF0..MF8/*.md` | Owner do BK | Apoio do BK |

## Cerimónias
- Planeamento semanal: segunda-feira 30 min (sequência BK e riscos).
- Sync intermédio: quarta-feira 15 min (bloqueios e handoff).
- Fecho de sprint: sexta-feira 30 min (aceite, proof, neg).

## Fluxo de atribuição e fecho de BK
1. Selecionar BK desbloqueado e confirmar owner/apoio.
2. Rever scope/scope-out e critérios binários do guia BK.
3. Executar incremento mínimo validável e smoke.
4. Executar negativos e checklist técnico.
5. Registar evidence (pr/proof/neg) e atualizar estado documental.

## Papel do orientador
- Nuno define guidance, priorização pedagógica e critérios de qualidade documental.
- Aprova exceções de escopo e desbloqueia conflitos de precedência.
- Não altera estado operacional de BK sem pedido explícito da equipa.

## Changelog
- **2026-04-12** - Documento de responsabilidades criado com governance e cerimónias.
