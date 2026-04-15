# PLANIFICACAO-STUDYFLOW

## Header
- `doc_id`: `PLANIFICACAO-STUDYFLOW`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo
Normalizar a planificacao da StudyFlow ao padrao OPSA/FaithFlix com governanca completa, cobertura rastreavel e foco pedagogico para 12o ano.

## Hierarquia canónica (ordem oficial)
1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `sprints/PLANO-SPRINTS.md`
4. `sprints/SCORECARD-SPRINTS.md`
5. `sprints/GUIAO-DOCENTE-SEMANAL.md`
6. `backlogs/MATRIZ-CANONICA-BK.md`
7. `backlogs/BACKLOG-MVP.md`
8. `backlogs/MF-VIEWS.md`
9. `backlogs/CONTRATO-CAMPOS-BK.md`
10. `backlogs/ANEXO-RF-PARA-BKS.md`
11. `backlogs/ANEXO-RNF-PARA-BKS.md`
12. `backlogs/ANEXO-BK-SPRINT-OWNER.md`
13. `guias-bk/README.md`

## Regra de precedencia
- Em conflito de dados operacionais, prevalece a ordem da hierarquia canónica.
- `MATRIZ-CANONICA-BK.md` e a fonte de referencia para ownership/prioridade/dependencias/rf_rnf.
- `BACKLOG-MVP.md` e `guias-bk` herdam os metadados da matriz sem excecoes.

## Regra de atualizacao em cadeia
1. Atualizar matriz.
2. Regenerar backlog e MF views.
3. Regenerar guias BK e anexos de rastreabilidade.
4. Atualizar sprints e scorecard.
5. Executar `scripts/validate-planificacao.sh`.

## Contrato de scorecard (pesos oficiais)
- Cobertura/rastreabilidade: `25`
- Coerencia documental: `20`
- Pedagogia/guidance/step-by-step: `25`
- Adequacao ao 12o: `20`
- Governanca/avaliacao: `10`

## Meta documental oficial
- Meta: `>=93/100`
- Estado alvo apos normalizacao: `PASS` em auditoria automatica.

## Changelog
- `2026-04-14`: estrutura/layout normalizados para alinhamento total com baseline OPSA+FaithFlix.
