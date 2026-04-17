#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

python3 docs/planificacao/scripts/auditar_planificacao.py > docs/planificacao/scripts/latest-audit.json
python3 docs/planificacao/scripts/gerar_relatorio_conformidade.py docs/planificacao/scripts/latest-audit.json >/dev/null
cat docs/planificacao/scripts/latest-audit.json
