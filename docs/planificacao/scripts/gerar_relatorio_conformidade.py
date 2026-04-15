#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import sys

TODAY = "2026-04-14"


def score_dim(pass_flag: bool, full: int, partial: int) -> int:
    return full if pass_flag else partial


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Uso: gerar_relatorio_conformidade.py <audit.json>")

    audit_path = Path(sys.argv[1]).resolve()
    data = json.loads(audit_path.read_text(encoding="utf-8"))

    st = data.get("status", {})
    coverage_pass = bool(st.get("coverage_pass"))
    consistency_pass = bool(st.get("consistency_pass"))
    guides_pass = bool(st.get("guides_pass"))
    governance_pass = bool(st.get("governance_pass"))

    # Adequacao ao 12o acompanha sobretudo qualidade dos guias e coerencia de sprints.
    adequacao_pass = guides_pass and consistency_pass

    s_cov = score_dim(coverage_pass, 25, 15)
    s_cons = score_dim(consistency_pass, 20, 12)
    s_ped = score_dim(guides_pass, 25, 14)
    s_adq = score_dim(adequacao_pass, 20, 12)
    s_gov = score_dim(governance_pass, 10, 5)
    total = s_cov + s_cons + s_ped + s_adq + s_gov

    status_text = "PASS" if bool(st.get("overall_pass")) else "FAIL"

    counts = data.get("counts", {})
    missing_artifacts = data.get("governance", {}).get("missing_artifacts", [])
    missing_rf = len(data.get("coverage", {}).get("missing_rf_matrix", [])) + len(data.get("coverage", {}).get("missing_rf_backlog", []))
    missing_rnf = len(data.get("coverage", {}).get("missing_rnf_matrix", [])) + len(data.get("coverage", {}).get("missing_rnf_backlog", []))
    guide_issues = len(data.get("guides_quality", {}).get("guide_header_issues", [])) + len(data.get("guides_quality", {}).get("guide_content_issues", []))

    plan_root = Path(__file__).resolve().parents[1]
    out_path = plan_root / "CONFORMIDADE-PLANIFICACAO.md"

    content = f"""# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Resultado global
- Estado da auditoria: `{status_text}`
- Score total: `{total}/100`
- Meta oficial: `>=93/100`
- Resultado da meta: `{'ATINGIDA' if total >= 93 else 'NAO ATINGIDA'}`

## Score por criterio
| criterio | peso | score |
| --- | --- | --- |
| Cobertura/rastreabilidade | 25 | {s_cov} |
| Coerencia documental | 20 | {s_cons} |
| Pedagogia/guidance/step-by-step | 25 | {s_ped} |
| Adequacao ao 12o | 20 | {s_adq} |
| Governanca/avaliacao | 10 | {s_gov} |

## Evidencias quantitativas
- RF detectados: `{counts.get('rf_docs', 0)}`
- RNF detectados: `{counts.get('rnf_docs', 0)}`
- BK na matriz: `{counts.get('matriz_bk', 0)}`
- BK no backlog: `{counts.get('backlog_bk', 0)}`
- Guias BK: `{counts.get('guide_bk', 0)}`
- Orfaos RF/RNF: `{missing_rf + missing_rnf}`
- Issues de guias: `{guide_issues}`
- Artefactos de governanca em falta: `{len(missing_artifacts)}`

## Evidencia tecnica
- Fonte de auditoria: `docs/planificacao/scripts/latest-audit.json`
- Comando de validacao: `./scripts/validate-planificacao.sh`

## Changelog
- `{TODAY}`: relatorio atualizado automaticamente a partir da auditoria deterministica.
"""

    out_path.write_text(content, encoding="utf-8")
    print(f"Relatorio de conformidade atualizado: {out_path}")


if __name__ == "__main__":
    main()
