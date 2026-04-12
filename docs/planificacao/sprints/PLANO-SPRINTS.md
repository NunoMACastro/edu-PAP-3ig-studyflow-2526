# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Capacidade por aluno
| Aluno | Horas/semana | Perfil |
| --- | --- | --- |
| Natália | 16h | BK críticos (P0/L) e arquitetura |
| Guilherme | 14h | Núcleo funcional, integração e P0/P1 |
| Kaua | 10h | Implementação P1/P2 e suporte |
| Daniel | 8h | Gestão, QA, documentação e apoio técnico |

## Conversão S/M/L
- `S` = 4h (entrega localizada).
- `M` = 8h (1-2 dependências ou integração moderada).
- `L` = 14h (impacto transversal, segurança/IA/arquitetura ou 3+ dependências).

## Calendário de sprints (semanal)
| Sprint | Período | Foco macro | KPI alvo |
| --- | --- | --- | --- |
| S01 | 13/04/2026 - 19/04/2026 | MF0 | >=85% BK planeados com checklist completo |
| S02 | 20/04/2026 - 26/04/2026 | MF0 | >=85% BK planeados com checklist completo |
| S03 | 27/04/2026 - 03/05/2026 | MF1 | >=85% BK planeados com checklist completo |
| S04 | 04/05/2026 - 10/05/2026 | MF1 | >=85% BK planeados com checklist completo |
| S05 | 11/05/2026 - 17/05/2026 | MF2 | >=85% BK planeados com checklist completo |
| S06 | 18/05/2026 - 24/05/2026 | MF2 | >=85% BK planeados com checklist completo |
| S07 | 25/05/2026 - 31/05/2026 | MF3 | >=85% BK planeados com checklist completo |
| S08 | 01/06/2026 - 07/06/2026 | MF4 | >=85% BK planeados com checklist completo |
| S09 | 08/06/2026 - 14/06/2026 | MF5 | >=85% BK planeados com checklist completo |
| S10 | 15/06/2026 - 21/06/2026 | MF5 | >=85% BK planeados com checklist completo |
| S11 | 22/06/2026 - 28/06/2026 | MF6 | >=85% BK planeados com checklist completo |
| S12 | 29/06/2026 - 05/07/2026 | MF7 | >=85% BK planeados com checklist completo |
| S13 | 06/07/2026 - 12/07/2026 | MF7 | >=85% BK planeados com checklist completo |
| S14 | 13/07/2026 - 19/07/2026 | MF8 | >=85% BK planeados com checklist completo |
| S15 | 20/07/2026 - 26/07/2026 | MF8 | >=85% BK planeados com checklist completo |
| S16 | 27/07/2026 - 02/08/2026 | Estabilização | >=85% BK planeados com checklist completo |

## Regras de replaneamento
1. Replaneamento apenas no fecho de sprint, salvo bloqueio crítico.
2. Priorizar desbloqueio de dependências antes de iniciar novos BK.
3. Preservar prioridade P0>P1>P2 e evitar fragmentação de BK L.
4. Qualquer desvio deve refletir-se em BACKLOG-MVP, MF-VIEWS e guias BK na mesma semana.

## Gate para dependências cruzadas MF2↔MF3
- Antes de fechar qualquer sprint com `BK-MF2-01`, validar desbloqueio de `BK-MF3-03`.
- Antes de fechar qualquer sprint com `BK-MF2-06`, validar desbloqueio de `BK-MF3-04`.
- Se o gate falhar, o BK mantém estado `TODO` e reentra no planeamento da semana seguinte.

## KPI por sprint
- % BK planeados concluídos no sprint.
- % checklists smoke/negativos/técnico completos.
- Nº de bloqueios abertos >48h.
- % BK com evidence completa (pr/proof/neg).

## Changelog
- **2026-04-12** - Plano semanal de sprints criado com arranque em 13/04/2026.
