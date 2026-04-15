#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re
from collections import defaultdict

EXPECTED_RF = [f"RF{i:02d}" for i in range(1, 63)]
EXPECTED_RNF = [f"RNF{i:02d}" for i in range(1, 45)]
VALID_LAST_UPDATED = {"2026-04-14"}
GUIDE_FILENAME_RE = re.compile(r"^BK-MF[0-8]-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")


# ----------------------------
# helpers
# ----------------------------


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_codes(path: Path, prefix: str) -> list[str]:
    return sorted(set(re.findall(rf"\b{prefix}\d{{2}}\b", read(path))))


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def parse_table_rows(md_text: str, header_prefix: str, stop_heading: str | None = None) -> list[dict[str, str]]:
    lines = md_text.splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith(header_prefix):
            header_idx = i
            break
    if header_idx is None:
        return []

    end_idx = len(lines)
    if stop_heading:
        for i in range(header_idx + 2, len(lines)):
            if lines[i].startswith(stop_heading):
                end_idx = i
                break

    headers = split_md_row(lines[header_idx])
    rows: list[dict[str, str]] = []
    for line in lines[header_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        rows.append(dict(zip(headers, cols)))
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip().replace("`", "")
    if raw in {"", "-", "transversal"}:
        return []
    out: list[str] = []
    for part in [x.strip() for x in raw.split(",") if x.strip()]:
        m = re.fullmatch(r"(RF|RNF)(\d{2})\.\.(\d{2})", part)
        if m:
            pref, s, e = m.groups()
            for n in range(int(s), int(e) + 1):
                out.append(f"{pref}{n:02d}")
        else:
            out.extend(re.findall(r"\b(?:RF|RNF)\d{2}\b", part))
    return out


def normalize_guia_path(cell: str) -> str:
    m = re.search(r"\(([^)]+)\)", cell)
    if not m:
        return ""
    rel = m.group(1).replace("../", "")
    return f"docs/planificacao/{rel}"


def extract_header_value(text: str, key: str) -> str:
    m = re.search(rf"^- `{re.escape(key)}`: `([^`]+)`", text, flags=re.MULTILINE)
    return m.group(1).strip() if m else ""


def has_required_blocks(text: str) -> bool:
    required = [
        "## Bloco pedagogico",
        "### Objetivo",
        "### Pre-requisitos",
        "### Erros comuns",
        "### Check de compreensao",
        "### Tempo estimado",
        "## Bloco operacional",
        "### Entrada",
        "### Passos",
        "### Validacao",
        "### Handoff",
        "## Snippet tecnico aplicavel",
    ]
    return all(section in text for section in required)


def has_non_placeholder_snippet(text: str) -> bool:
    if "## Snippet tecnico aplicavel" not in text:
        return False
    placeholder_tokens = [
        "Adicionar aqui",
        "Trecho real e aplicavel",
        "Snippet real e aplicavel",
        "placeholder",
    ]
    if any(t in text for t in placeholder_tokens):
        return False
    return re.search(r"```[a-zA-Z0-9]*\n.+?```", text, flags=re.DOTALL) is not None


def extract_min_negativos(text: str) -> int:
    m = re.search(r"Negativos: minimo `?(\d+)`?", text)
    return int(m.group(1)) if m else 0


def scorecard_issues(score_text: str) -> list[str]:
    expected = {
        "Cobertura/rastreabilidade": 25,
        "Coerencia documental": 20,
        "Pedagogia/guidance/step-by-step": 25,
        "Adequacao ao 12o": 20,
        "Governanca/avaliacao": 10,
    }
    issues = []
    for name, weight in expected.items():
        if not re.search(rf"\|\s*{re.escape(name)}\s*\|\s*{weight}\s*\|", score_text):
            issues.append(f"missing_or_invalid_score_criterion:{name}")
    return issues


def sprints_issues(text: str) -> list[str]:
    found = sorted(set(re.findall(r"\|\s*(S\d{2})\s*\|", text)))
    expected = [f"S{i:02d}" for i in range(1, 13)]
    issues: list[str] = []
    if found != expected:
        issues.append(f"invalid_sprint_set:{found}")
    if "S13" in text or "S14" in text or "S15" in text or "S16" in text:
        issues.append("legacy_sprints_detected")
    return issues


# ----------------------------
# main
# ----------------------------


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    plan = repo / "docs" / "planificacao"
    backlogs = plan / "backlogs"
    guides_root = plan / "guias-bk"

    rf_codes = extract_codes(repo / "docs" / "RF.md", "RF")
    rnf_codes = extract_codes(repo / "docs" / "RNF.md", "RNF")

    rf_expected = set(EXPECTED_RF)
    rnf_expected = set(EXPECTED_RNF)

    matriz_rows = parse_table_rows(
        read(backlogs / "MATRIZ-CANONICA-BK.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | sprint | core_or_reforco | proximo_bk_recomendado | guia_path |",
    )
    backlog_rows = parse_table_rows(
        read(backlogs / "BACKLOG-MVP.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | sprint | core_or_reforco | proximo_bk | guia |",
        "## MF0",
    )

    matriz_by_bk = {r["bk_id"]: r for r in matriz_rows}
    backlog_by_bk = {r["bk_id"]: r for r in backlog_rows}

    matrix_refs: set[str] = set()
    backlog_refs: set[str] = set()
    invalid_refs: set[str] = set()

    for row in matriz_rows:
        for req in parse_items(row["rf_rnf"]):
            matrix_refs.add(req)
            if req.startswith("RF") and req not in rf_expected:
                invalid_refs.add(req)
            if req.startswith("RNF") and req not in rnf_expected:
                invalid_refs.add(req)

    for row in backlog_rows:
        for req in parse_items(row["rf_rnf"]):
            backlog_refs.add(req)
            if req.startswith("RF") and req not in rf_expected:
                invalid_refs.add(req)
            if req.startswith("RNF") and req not in rnf_expected:
                invalid_refs.add(req)

    missing_rf_matrix = sorted(rf_expected - {x for x in matrix_refs if x.startswith("RF")})
    missing_rnf_matrix = sorted(rnf_expected - {x for x in matrix_refs if x.startswith("RNF")})
    missing_rf_backlog = sorted(rf_expected - {x for x in backlog_refs if x.startswith("RF")})
    missing_rnf_backlog = sorted(rnf_expected - {x for x in backlog_refs if x.startswith("RNF")})

    mismatches = []
    compare_fields = ["owner", "prioridade", "dependencias", "rf_rnf", "sprint", "core_or_reforco"]
    for bk_id, mrow in matriz_by_bk.items():
        brow = backlog_by_bk.get(bk_id)
        if not brow:
            mismatches.append({"bk_id": bk_id, "type": "missing_in_backlog"})
            continue

        diff = {}
        for f in compare_fields:
            mv = mrow.get(f, "").strip()
            bv = brow.get(f, "").strip()
            if f in {"dependencias", "rf_rnf"}:
                if sorted(parse_items(mv)) != sorted(parse_items(bv)):
                    diff[f] = {"matrix": mv, "backlog": bv}
            elif mv != bv:
                diff[f] = {"matrix": mv, "backlog": bv}

        expected_guia_path = normalize_guia_path(brow.get("guia", ""))
        if mrow.get("guia_path", "").strip() != expected_guia_path:
            diff["guia_path"] = {
                "matrix": mrow.get("guia_path", "").strip(),
                "backlog": expected_guia_path,
            }

        if diff:
            mismatches.append({"bk_id": bk_id, "type": "field_mismatch", "diff": diff})

    # Guides / naming
    guide_files = sorted(guides_root.glob("MF*/BK-MF*-*.md"))
    legacy_files = sorted(guides_root.glob("MF*/BK-MF[0-8]-[0-9][0-9].md"))

    existing_guide_paths = {f"docs/planificacao/guias-bk/{p.parent.name}/{p.name}" for p in guide_files}

    broken_guia_links = []
    for row in backlog_rows:
        path = normalize_guia_path(row.get("guia", ""))
        if path not in existing_guide_paths:
            broken_guia_links.append({"bk_id": row["bk_id"], "guia_path": path})

    required_headers = [
        "bk_id",
        "macro",
        "owner",
        "apoio",
        "prioridade",
        "estado",
        "esforco",
        "dependencias",
        "rf_rnf",
        "fase_documental",
        "sprint",
        "core_or_reforco",
        "proximo_bk",
        "guia_path",
        "last_updated",
    ]

    guide_header_issues = []
    guide_content_issues = []
    naming_issues = []
    missing_guides = []

    for guide in guide_files:
        text = read(guide)
        bk_id = extract_header_value(text, "bk_id")
        if not bk_id:
            naming_issues.append({"guide": str(guide), "issue": "missing_bk_id_header"})
            continue

        row = backlog_by_bk.get(bk_id)
        if not row:
            missing_guides.append({"guide": str(guide), "reason": "bk_not_in_backlog"})
            continue

        if not GUIDE_FILENAME_RE.match(guide.name):
            naming_issues.append({"bk_id": bk_id, "issue": "filename_not_slug_pattern", "file": guide.name})
        if not guide.name.startswith(f"{bk_id}-"):
            naming_issues.append({"bk_id": bk_id, "issue": "filename_not_prefixed_by_bk_id", "file": guide.name})

        for h in required_headers:
            if not extract_header_value(text, h):
                guide_header_issues.append({"bk_id": bk_id, "missing": h})

        expected_core = "Reforco" if row["prioridade"] == "P0" else "Core"
        actual_core = extract_header_value(text, "core_or_reforco")
        if actual_core != expected_core:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": f"core_or_reforco != {expected_core}"})

        expected_sprint = row["sprint"]
        actual_sprint = extract_header_value(text, "sprint")
        if actual_sprint != expected_sprint:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "sprint_not_matching_backlog"})

        expected_path = f"docs/planificacao/guias-bk/{guide.parent.name}/{guide.name}"
        actual_path = extract_header_value(text, "guia_path")
        if actual_path != expected_path:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "guia_path_not_matching_file"})

        if sorted(parse_items(extract_header_value(text, "rf_rnf"))) != sorted(parse_items(row["rf_rnf"])):
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "rf_rnf_not_matching_backlog"})

        if not has_required_blocks(text):
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_pedagogic_or_operational_blocks"})

        if not has_non_placeholder_snippet(text):
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_or_placeholder_snippet"})

        step_count = len(re.findall(r"^\d+\. ", text, flags=re.MULTILINE))
        min_negativos = extract_min_negativos(text)
        if row["prioridade"] == "P0" and (step_count < 8 or min_negativos < 3):
            guide_content_issues.append({"bk_id": bk_id, "issue": f"P0_minimos(step={step_count},neg={min_negativos})"})
        if row["prioridade"] in {"P1", "P2"} and (step_count < 6 or min_negativos < 2):
            guide_content_issues.append({"bk_id": bk_id, "issue": f"P1P2_minimos(step={step_count},neg={min_negativos})"})

    for lf in legacy_files:
        naming_issues.append({"file": str(lf), "issue": "legacy_filename_without_slug"})

    # Dependencies integrity + cycle detection
    deps_invalid = []
    graph: dict[str, list[str]] = defaultdict(list)
    for row in matriz_rows:
        bk = row["bk_id"]
        for dep in parse_items(row["dependencias"]):
            if dep not in matriz_by_bk:
                deps_invalid.append({"bk_id": bk, "dep": dep})
            else:
                graph[bk].append(dep)

    cycles = []
    seen: set[str] = set()
    visiting: set[str] = set()

    def dfs(node: str, stack: list[str]) -> None:
        if node in visiting:
            if node in stack:
                cycles.append(stack[stack.index(node) :] + [node])
            return
        if node in seen:
            return
        visiting.add(node)
        for nxt in graph.get(node, []):
            dfs(nxt, stack + [nxt])
        visiting.remove(node)
        seen.add(node)

    for n in graph:
        dfs(n, [n])

    # Governance files
    required_artifacts = [
        plan / "sprints" / "SCORECARD-SPRINTS.md",
        plan / "sprints" / "GUIAO-DOCENTE-SEMANAL.md",
        plan / "sprints" / "GATES-S4-S8-S12.md",
        backlogs / "CONTRATO-CAMPOS-BK.md",
        backlogs / "ANEXO-RF-PARA-BKS.md",
        backlogs / "ANEXO-RNF-PARA-BKS.md",
        backlogs / "ANEXO-BK-SPRINT-OWNER.md",
    ]
    missing_artifacts = [str(p) for p in required_artifacts if not p.exists()]

    scorecard_text = read(plan / "sprints" / "SCORECARD-SPRINTS.md")
    scorecard_contract_issues = scorecard_issues(scorecard_text)

    sprint_plan_text = read(plan / "sprints" / "PLANO-SPRINTS.md")
    sprint_contract_issues = sprints_issues(sprint_plan_text)

    gates_text = read(plan / "sprints" / "GATES-S4-S8-S12.md")
    gate_issues = []
    for g in ["S4", "S8", "S12"]:
        if g not in gates_text:
            gate_issues.append(f"missing_gate:{g}")

    plan_docs = [
        plan / "README.md",
        plan / "PLANO-IMPLEMENTACAO-TOTAL.md",
        plan / "CONFORMIDADE-PLANIFICACAO.md",
        plan / "DISTRIBUICAO-RESPONSABILIDADES.md",
        plan / "sprints" / "PLANO-SPRINTS.md",
        plan / "sprints" / "SCORECARD-SPRINTS.md",
        plan / "sprints" / "GUIAO-DOCENTE-SEMANAL.md",
        plan / "sprints" / "GATES-S4-S8-S12.md",
        backlogs / "MATRIZ-CANONICA-BK.md",
        backlogs / "BACKLOG-MVP.md",
        backlogs / "MF-VIEWS.md",
        backlogs / "CONTRATO-CAMPOS-BK.md",
        backlogs / "ANEXO-RF-PARA-BKS.md",
        backlogs / "ANEXO-RNF-PARA-BKS.md",
        backlogs / "ANEXO-BK-SPRINT-OWNER.md",
        plan / "guias-bk" / "README.md",
    ]

    outdated_docs = []
    for p in plan_docs:
        text = read(p)
        if not any(f"`last_updated`: `{d}`" in text for d in VALID_LAST_UPDATED):
            outdated_docs.append(str(p))

    rf_count_issues = []
    if set(rf_codes) != rf_expected:
        rf_count_issues.append(
            {
                "expected": len(rf_expected),
                "found": len(set(rf_codes)),
                "missing": sorted(rf_expected - set(rf_codes)),
                "extra": sorted(set(rf_codes) - rf_expected),
            }
        )

    rnf_count_issues = []
    if set(rnf_codes) != rnf_expected:
        rnf_count_issues.append(
            {
                "expected": len(rnf_expected),
                "found": len(set(rnf_codes)),
                "missing": sorted(rnf_expected - set(rnf_codes)),
                "extra": sorted(set(rnf_codes) - rnf_expected),
            }
        )

    result = {
        "counts": {
            "rf_docs": len(set(rf_codes)),
            "rnf_docs": len(set(rnf_codes)),
            "matriz_bk": len(matriz_rows),
            "backlog_bk": len(backlog_rows),
            "guide_bk": len(guide_files),
        },
        "coverage": {
            "rf_contract_issues": rf_count_issues,
            "rnf_contract_issues": rnf_count_issues,
            "missing_rf_matrix": missing_rf_matrix,
            "missing_rnf_matrix": missing_rnf_matrix,
            "missing_rf_backlog": missing_rf_backlog,
            "missing_rnf_backlog": missing_rnf_backlog,
            "invalid_refs": sorted(invalid_refs),
        },
        "consistency": {
            "matriz_backlog_mismatches": mismatches,
            "broken_guia_links": broken_guia_links,
            "invalid_dependencies": deps_invalid,
            "cycles": cycles,
            "outdated_docs": outdated_docs,
            "scorecard_contract_issues": scorecard_contract_issues,
            "sprint_contract_issues": sprint_contract_issues,
            "gate_issues": gate_issues,
        },
        "guides_quality": {
            "guide_header_issues": guide_header_issues,
            "guide_content_issues": guide_content_issues,
            "naming_issues": naming_issues,
            "missing_guides": missing_guides,
        },
        "governance": {
            "missing_artifacts": missing_artifacts,
        },
    }

    coverage_pass = (
        not rf_count_issues
        and not rnf_count_issues
        and not missing_rf_matrix
        and not missing_rnf_matrix
        and not missing_rf_backlog
        and not missing_rnf_backlog
        and not invalid_refs
    )
    consistency_pass = (
        not mismatches
        and not broken_guia_links
        and not deps_invalid
        and not cycles
        and not outdated_docs
        and not scorecard_contract_issues
        and not sprint_contract_issues
        and not gate_issues
    )
    guides_pass = not guide_header_issues and not guide_content_issues and not naming_issues and not missing_guides
    governance_pass = not missing_artifacts

    result["status"] = {
        "coverage_pass": coverage_pass,
        "consistency_pass": consistency_pass,
        "guides_pass": guides_pass,
        "naming_pass": not naming_issues,
        "governance_pass": governance_pass,
        "overall_pass": coverage_pass and consistency_pass and guides_pass and governance_pass,
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
