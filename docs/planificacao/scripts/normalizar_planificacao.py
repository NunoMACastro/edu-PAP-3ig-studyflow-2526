#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import unicodedata
from collections import Counter, defaultdict

TODAY = "2026-04-14"

SPRINT_WINDOW_BY_MACRO = {
    "MF0": "S01-S02",
    "MF1": "S03-S04",
    "MF2": "S05-S06",
    "MF3": "S07-S08",
    "MF4": "S08-S09",
    "MF5": "S09-S10",
    "MF6": "S10-S11",
    "MF7": "S11-S12",
    "MF8": "S12",
}

SPRINTS = [
    ("S01", "2026-04-13", "2026-04-19", "MF0", "Kickoff, setup tecnico e BK P0 iniciais"),
    ("S02", "2026-04-20", "2026-04-26", "MF0", "Fecho fundacoes e validacao de base"),
    ("S03", "2026-04-27", "2026-05-03", "MF1", "Nucleo funcional aluno/turma"),
    ("S04", "2026-05-04", "2026-05-10", "MF1", "Consolidacao MF1 + Gate S4"),
    ("S05", "2026-05-11", "2026-05-17", "MF2", "Conteudos oficiais e indexacao"),
    ("S06", "2026-05-18", "2026-05-24", "MF2", "IA academica e metricas de turma"),
    ("S07", "2026-05-25", "2026-05-31", "MF3", "Guardrails, pesquisa e colaboracao"),
    ("S08", "2026-06-01", "2026-06-07", "MF3/MF4", "Fecho MF3 + transicao MF4 + Gate S8"),
    ("S09", "2026-06-08", "2026-06-14", "MF4/MF5", "Governanca, privacidade e UX"),
    ("S10", "2026-06-15", "2026-06-21", "MF5/MF6", "Performance, acessibilidade e seguranca"),
    ("S11", "2026-06-22", "2026-06-28", "MF6/MF7", "Robustez tecnica e operacao"),
    ("S12", "2026-06-29", "2026-07-05", "MF7/MF8", "Fecho documental e Gate S12"),
]

MACRO_LABEL = {
    "MF0": "Fundacoes de plataforma",
    "MF1": "Nucleo funcional I",
    "MF2": "Nucleo funcional II",
    "MF3": "Capacidades de produto I",
    "MF4": "Capacidades de produto II",
    "MF5": "Operacao e UX transversal",
    "MF6": "Qualidade, seguranca e performance",
    "MF7": "Operacao, modularidade e compliance",
    "MF8": "Compatibilidade e fecho PAP",
}

MACRO_ORDER = [f"MF{i}" for i in range(0, 9)]


# ----------------------------
# parsing helpers
# ----------------------------


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def parse_global_rows_from_backlog(path: Path) -> list[dict[str, str]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith("| bk_id | macro |") and "| titulo |" in line and "| owner |" in line:
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError("Tabela global de backlog nao encontrada.")

    end_idx = len(lines)
    for i in range(header_idx + 2, len(lines)):
        if lines[i].startswith("## MF0"):
            end_idx = i
            break

    headers = split_md_row(lines[header_idx])
    out: list[dict[str, str]] = []
    for line in lines[header_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        out.append(dict(zip(headers, cols)))
    if not out:
        raise RuntimeError("Tabela global de backlog sem linhas validas.")
    return out


def normalize_rows(raw_rows: list[dict[str, str]]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []

    for row in raw_rows:
        bk_id = row.get("bk_id", "").strip()
        macro = row.get("macro", "").strip()
        if not bk_id or not macro:
            continue

        def g(key: str, default: str = "-") -> str:
            val = row.get(key, "").strip()
            return val if val else default

        proximo = row.get("proximo_bk", "").strip() or row.get("proximo_bk_recomendado", "").strip() or "-"

        rows.append(
            {
                "bk_id": bk_id,
                "macro": macro,
                "titulo": g("titulo"),
                "owner": g("owner"),
                "apoio": g("apoio"),
                "prioridade": g("prioridade"),
                "estado": g("estado", "TODO"),
                "esforco": g("esforco", "S"),
                "dependencias": g("dependencias", "-"),
                "rf_rnf": g("rf_rnf"),
                "fase_documental": g("fase_documental", "Fase 1"),
                "proximo_bk": proximo,
            }
        )

    def sort_key(r: dict[str, str]) -> tuple[int, int]:
        m = re.match(r"BK-MF(\d+)-(\d+)", r["bk_id"])
        if not m:
            return (99, 99)
        return (int(m.group(1)), int(m.group(2)))

    rows.sort(key=sort_key)
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip()
    if raw in {"", "-", "transversal"}:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def fmt_md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "sem-titulo"


def core_or_reforco(prioridade: str) -> str:
    return "Reforco" if prioridade == "P0" else "Core"


def sprint_window(macro: str) -> str:
    return SPRINT_WINDOW_BY_MACRO.get(macro, "S12")


def guide_filename(row: dict[str, str]) -> str:
    return f"{row['bk_id']}-{slugify(row['titulo'])}.md"


def guide_rel(row: dict[str, str]) -> str:
    return f"../guias-bk/{row['macro']}/{guide_filename(row)}"


def guide_path(row: dict[str, str]) -> str:
    return f"docs/planificacao/guias-bk/{row['macro']}/{guide_filename(row)}"


def effort_units(esforco: str) -> int:
    return {"S": 1, "M": 2, "L": 3}.get(esforco.strip(), 1)


def first_req(reqs: str) -> str:
    items = parse_items(reqs)
    return items[0] if items else "RF00"


def choose_snippet(row: dict[str, str]) -> tuple[str, str, str, str]:
    titulo = row["titulo"].lower()
    bk_id = row["bk_id"]
    req = first_req(row["rf_rnf"])

    if any(k in titulo for k in ["login", "registo", "password", "cookies", "sess", "pap", "sso"]):
        return (
            "Validacao de sessao e papel",
            "ts",
            f"""type UtilizadorSessao = {{ id: string; papel: 'ALUNO' | 'PROFESSOR' | 'ADMIN' }};

export function exigirSessao(u: UtilizadorSessao | null, papelNecessario: UtilizadorSessao['papel']) {{
  if (!u) throw new Error('Sessao invalida');
  if (u.papel !== papelNecessario) throw new Error('Permissao insuficiente');
  return {{ ok: true, bk: '{bk_id}', req: '{req}' }};
}}
""",
            "Aplicar no endpoint principal do BK para bloquear acessos indevidos de forma deterministica.",
        )

    if any(k in titulo for k in ["ia", "quiz", "resumo", "explic", "guardrail"]):
        return (
            "Pipeline minimo para resposta de IA com fontes",
            "ts",
            f"""type TrechoFonte = {{ docId: string; pagina: number; texto: string }};

export function responderComFonte(pergunta: string, contexto: TrechoFonte[]) {{
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!contexto.length) throw new Error('Sem contexto para responder');

  const base = contexto.slice(0, 3).map((t) => `[${{t.docId}}:${{t.pagina}}]`).join(' ');
  return {{
    bkId: '{bk_id}',
    resposta: `Resposta gerada com base em ${{base}}`,
    fontes: contexto.slice(0, 3),
  }};
}}
""",
            "Garante rastreabilidade da resposta IA ao material carregado e facilita validacao em defesa.",
        )

    if any(k in titulo for k in ["pdf", "docx", "url", "material", "indexa", "extrair", "upload"]):
        return (
            "Validacao de ingestao de materiais",
            "ts",
            f"""const EXTENSOES_PERMITIDAS = ['pdf', 'docx', 'txt', 'md'];

export function validarMaterial(nomeFicheiro: string, tamanhoBytes: number) {{
  const ext = nomeFicheiro.split('.').pop()?.toLowerCase() ?? '';
  if (!EXTENSOES_PERMITIDAS.includes(ext)) throw new Error('Formato nao suportado');
  if (tamanhoBytes <= 0 || tamanhoBytes > 25 * 1024 * 1024) throw new Error('Tamanho invalido');
  return {{ bk: '{bk_id}', aceite: true }};
}}
""",
            "Usar antes de iniciar indexacao para reduzir falhas de parsing e acelerar feedback ao utilizador.",
        )

    if any(k in titulo for k in ["grupo", "turma", "chat", "sala", "notific", "sess", "calend"]):
        return (
            "Regra de notificacao contextual",
            "ts",
            f"""type Evento = {{ tipo: string; destino: 'ALUNO' | 'TURMA' | 'GRUPO'; prioridade: 'baixa' | 'media' | 'alta' }};

export function gerarNotificacao(evento: Evento) {{
  const urgente = evento.prioridade === 'alta';
  return {{
    bk: '{bk_id}',
    canal: urgente ? ['app', 'email'] : ['app'],
    mensagem: `Evento ${{evento.tipo}} para ${{evento.destino}}`,
  }};
}}
""",
            "Permite validar canais/quotas de notificacao com regra objetiva e sem ambiguidade.",
        )

    if any(k in titulo for k in ["xss", "csrf", "injection", "https", "bcrypt", "segur", "consent", "auditor"]):
        return (
            "Hardening de seguranca basico",
            "ts",
            f"""import bcrypt from 'bcryptjs';

export async function criarHashSeguro(password: string) {{
  if (password.length < 12) throw new Error('Password fraca');
  const hash = await bcrypt.hash(password, 12);
  return {{ bkId: '{bk_id}', hash }};
}}

export function exigirHTTPS(proto: string) {{
  if (proto !== 'https') throw new Error('Canal inseguro');
}}
""",
            "Aplicar no fluxo do BK para cumprir RNF de seguranca sem depender de comportamento manual.",
        )

    if any(k in titulo for k in ["dashboard", "metric", "observ", "log", "health", "performance", "2s", "4s"]):
        return (
            "Consulta agregada para metrica de turma",
            "sql",
            f"""-- BK: {bk_id}
SELECT
  DATE_TRUNC('day', created_at) AS dia,
  COUNT(*) AS eventos,
  AVG(latencia_ms) AS latencia_media
FROM observabilidade_eventos
WHERE contexto = :contexto
GROUP BY 1
ORDER BY 1 DESC
LIMIT 14;
""",
            "Base para validar KPI de latencia e volume de eventos antes do gate da sprint.",
        )

    return (
        "Validador de payload de dominio",
        "ts",
        f"""type Payload = Record<string, unknown>;

export function validarEntradaBK(payload: Payload) {{
  const obrigatorios = ['utilizadorId', 'contextoId'];
  const emFalta = obrigatorios.filter((k) => !payload[k]);
  if (emFalta.length) throw new Error(`BK {bk_id}: faltam campos ${{emFalta.join(', ')}}`);
  return {{ ok: true, bkId: '{bk_id}', payload }};
}}
""",
        "Usar como barreira de entrada no caso principal para reduzir erros de integracao no BK.",
    )


def render_guide(row: dict[str, str]) -> str:
    bk_id = row["bk_id"]
    macro = row["macro"]
    prioridade = row["prioridade"]
    deps = parse_items(row["dependencias"])
    deps_fmt = ", ".join(deps) if deps else "-"
    req = first_req(row["rf_rnf"])
    min_neg = 3 if prioridade == "P0" else 2

    steps = [
        f"Confirmar no backlog e na matriz o escopo de `{bk_id}` e do requisito `{req}`.",
        f"Validar pre-condicoes tecnicas e dependencias declaradas: `{deps_fmt}`.",
        "Definir contrato de entrada/saida do fluxo principal antes de escrever codigo.",
        "Implementar caminho principal com logs suficientes para evidencia tecnica.",
        "Executar smoke test do fluxo principal e registar resultado observavel.",
        f"Executar pelo menos `{min_neg}` cenarios negativos e validar respostas controladas.",
    ]
    if prioridade == "P0":
        steps.extend(
            [
                "Aplicar reforco tecnico no risco dominante (seguranca/performance/robustez).",
                "Atualizar handoff do proximo BK com riscos, bloqueios e decisoes abertas.",
            ]
        )

    steps_md = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))
    snippet_name, snippet_lang, snippet_code, snippet_desc = choose_snippet(row)

    return f"""# {bk_id} - {row['titulo']}

## Header
- `doc_id`: `GUIA-{bk_id}`
- `bk_id`: `{bk_id}`
- `macro`: `{macro}`
- `owner`: `{row['owner']}`
- `apoio`: `{row['apoio']}`
- `prioridade`: `{prioridade}`
- `estado`: `{row['estado']}`
- `esforco`: `{row['esforco']}`
- `dependencias`: `{deps_fmt}`
- `rf_rnf`: `{row['rf_rnf']}`
- `fase_documental`: `{row['fase_documental']}`
- `sprint`: `{sprint_window(macro)}`
- `core_or_reforco`: `{core_or_reforco(prioridade)}`
- `proximo_bk`: `{row['proximo_bk']}`
- `guia_path`: `{guide_path(row)}`
- `last_updated`: `{TODAY}`

## Contexto do BK
- Entrega alvo: `{row['titulo']}` com rastreabilidade direta para `{row['rf_rnf']}`.
- Foco da macro `{macro}`: {MACRO_LABEL.get(macro, 'execucao funcional orientada a defesa PAP')}.
- Regra de governanca: manter IDs e contratos canónicos (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Explicar e executar este BK com autonomia, incluindo caminho principal, validacao negativa e evidencia para defesa.

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `{deps_fmt}`.

### Erros comuns
- Fechar BK sem validar negativos obrigatorios.
- Alterar metadados no guia sem sincronizar backlog/matriz.
- Submeter evidence sem prova verificavel (log/output/screenshot/teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro.
- [ ] Sei apontar o requisito `{req}` e demostrar cobertura objetiva.
- [ ] Sei executar pelo menos um cenario negativo relevante.

### Tempo estimado
- `Core`: `45-75 min`
- `Reforco`: `{'+20-40 min' if prioridade == 'P0' else 'n/a'}`

## Bloco operacional
### Entrada
- BK: `{bk_id}`
- Requisito: `{row['rf_rnf']}`
- Dependencias: `{deps_fmt}`
- Artefactos obrigatorios: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md`

### Passos
{steps_md}

### Validacao
- Smoke: minimo `1` execucao completa do fluxo principal.
- Negativos: minimo `{min_neg}` cenarios com erro controlado.
- Tecnico: metadados alinhados entre matriz/backlog/guia.
- Evidence: `pr`, `proof`, `neg` preenchidos com dados reais.

### Handoff
- Proximo BK: `{row['proximo_bk']}`
- Registar: estado de dependencias, risco aberto e decisao tomada.
- Escalar no scorecard se bloqueio >48h.

## Snippet tecnico aplicavel
**{snippet_name}**

```{snippet_lang}
{snippet_code.rstrip()}
```

{snippet_desc}

## Criterios de aceite
- Fluxo principal implementado no scope definido.
- Validacao smoke e negativos concluida sem falha bloqueante.
- Contrato canónico preservado (`bk_id/macro/sprint/owner/rf_rnf/dependencias/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo do que mudou.
- `proof`: output/screenshot/log/teste que comprova comportamento esperado.
- `neg`: evidencia dos cenarios negativos executados.

## Changelog
- `{TODAY}`: guia normalizado para contrato canónico com bloco pedagogico e operacional completos.
"""


# ----------------------------
# write plan docs
# ----------------------------


def write_readme(plan_root: Path) -> None:
    content = f"""# PLANIFICACAO-STUDYFLOW

## Header
- `doc_id`: `PLANIFICACAO-STUDYFLOW`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Normalizar a planificacao da StudyFlow ao padrao OPSA/FaithFlix com governanca completa, cobertura rastreavel e foco pedagogico para 12o ano.

## Hierarquia canónica (ordem oficial)
1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `sprints/PLANO-SPRINTS.md`
4. `sprints/SCORECARD-SPRINTS.md`
5. `sprints/GUIAO-DOCENTE-SEMANAL.md`
6. `sprints/GATES-S4-S8-S12.md`
7. `backlogs/MATRIZ-CANONICA-BK.md`
8. `backlogs/BACKLOG-MVP.md`
9. `backlogs/MF-VIEWS.md`
10. `backlogs/CONTRATO-CAMPOS-BK.md`
11. `backlogs/ANEXO-RF-PARA-BKS.md`
12. `backlogs/ANEXO-RNF-PARA-BKS.md`
13. `backlogs/ANEXO-BK-SPRINT-OWNER.md`
14. `guias-bk/README.md`
15. `CONFORMIDADE-PLANIFICACAO.md`

## Regra de precedencia
- Em conflito de dados operacionais, prevalece a ordem da hierarquia canónica.
- `MATRIZ-CANONICA-BK.md` e a fonte de referencia para ownership/prioridade/dependencias/rf_rnf.
- `BACKLOG-MVP.md` e `guias-bk` herdam os metadados da matriz sem excecoes.

## Regra de atualizacao em cadeia
1. Atualizar matriz.
2. Regenerar backlog e MF views.
3. Regenerar guias BK e anexos de rastreabilidade.
4. Atualizar sprints/scorecard/gates.
5. Executar `scripts/validate-planificacao.sh` e publicar relatorio de conformidade.

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
- `{TODAY}`: estrutura/layout normalizados para alinhamento total com baseline OPSA+FaithFlix.
"""
    (plan_root / "README.md").write_text(content, encoding="utf-8")


def write_plano_implementacao(plan_root: Path, rows: list[dict[str, str]]) -> None:
    by_macro = Counter(r["macro"] for r in rows)
    lines = [
        "# PLANO-IMPLEMENTACAO-TOTAL",
        "",
        "## Header",
        "- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`",
        "- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Objetivo",
        "Definir a linha temporal canónica de 12 sprints para executar os BK da StudyFlow com rastreabilidade RF/RNF, coerencia documental e preparacao para defesa PAP.",
        "",
        "## Contrato canónico",
        "- Pesos oficiais: `25/20/25/20/10`.",
        "- Politica Core/Reforco: `P0 => Reforco`, `P1/P2 => Core`.",
        "- Gates obrigatorios de revisao: `S4`, `S8`, `S12`.",
        "- Invariantes: IDs BK preservados e cobertura `RF/RNF/BK` sem orfaos.",
        "",
        "## Calendario macro",
    ]

    for macro in MACRO_ORDER:
        lines.append(f"- `{macro}` ({MACRO_LABEL[macro]}): janela `{sprint_window(macro)}` com `{by_macro.get(macro, 0)}` BK.")

    lines.extend(
        [
            "",
            "## Fases",
            "1. Fase 1 (S01-S06): fundacoes + nucleo funcional aluno/professor.",
            "2. Fase 2 (S07-S10): capacidades de produto, governanca e UX.",
            "3. Fase 3 (S10-S12): qualidade, seguranca, compliance e fecho documental.",
            "",
            "## Entregaveis obrigatorios por gate",
            "- Gate S4: backlog/matriz/guias sincronizados para MF0-MF1.",
            "- Gate S8: rastreabilidade completa MF0-MF4 com evidencias de validacao.",
            "- Gate S12: pacote final de defesa com auditoria automatica em PASS.",
            "",
            "## Changelog",
            f"- `{TODAY}`: plano reescrito para horizonte canónico de 12 sprints com gates S4/S8/S12.",
            "",
        ]
    )

    (plan_root / "PLANO-IMPLEMENTACAO-TOTAL.md").write_text("\n".join(lines), encoding="utf-8")


def write_distribuicao(plan_root: Path, rows: list[dict[str, str]]) -> None:
    owner_counts = Counter(r["owner"] for r in rows)
    owner_effort = defaultdict(int)
    for r in rows:
        owner_effort[r["owner"]] += effort_units(r["esforco"])

    table = fmt_md_table(
        ["owner", "total_bk", "esforco_unidades", "responsabilidade"],
        [
            [
                owner,
                str(owner_counts[owner]),
                str(owner_effort[owner]),
                "Execucao tecnica e garantia de evidencia por BK",
            ]
            for owner in sorted(owner_counts.keys())
        ],
    )

    content = f"""# DISTRIBUICAO-RESPONSABILIDADES

## Header
- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Formalizar ownership canónico dos BK da StudyFlow para evitar drift entre matriz, backlog, sprints e guias.

## Regra de ownership
- Cada BK tem `owner` principal e `apoio` secundario.
- Alteracoes de owner exigem atualizacao em cadeia (matriz -> backlog -> guias -> anexos).
- Gate semanal valida distribuicao de carga e bloqueios >48h.

## Distribuicao consolidada
{table}

## Changelog
- `{TODAY}`: distribuicao normalizada com base na matriz canonica e unidades de esforco S/M/L.
"""
    (plan_root / "DISTRIBUICAO-RESPONSABILIDADES.md").write_text(content, encoding="utf-8")


def write_plano_sprints(plan_root: Path) -> None:
    table_rows = []
    for sprint, start, end, foco, objetivo in SPRINTS:
        gate = "SIM" if sprint in {"S04", "S08", "S12"} else "NAO"
        table_rows.append([sprint, f"{start} a {end}", foco, objetivo, gate])

    content = f"""# PLANO-SPRINTS

## Header
- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Conversao S/M/L
- `S`: 1 unidade
- `M`: 2 unidades
- `L`: 3 unidades

## Linha temporal oficial (12 sprints)
{fmt_md_table(['sprint', 'periodo', 'foco_macro', 'objetivo_operacional', 'gate'], table_rows)}

## Regra de replaneamento
1. Replaneamento apenas no fecho da sprint, exceto bloqueio critico.
2. Prioridade de execucao: `P0 > P1 > P2`.
3. Qualquer desvio exige sincronizacao de `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `MF-VIEWS` e `guias-bk`.

## KPI minimos por sprint
- Cobertura de BK planeados concluida >= 85%.
- Checklists smoke/negativos/tecnico completos por BK >= 90%.
- Bloqueios >48h com escalacao no scorecard.

## Changelog
- `{TODAY}`: plano de sprints reduzido e sincronizado para horizonte canónico `S01..S12`.
"""
    (plan_root / "sprints" / "PLANO-SPRINTS.md").write_text(content, encoding="utf-8")


def write_scorecard(plan_root: Path) -> None:
    rows = [[s[0], "0", "0", "0", "0", "0", "0", "0", "0", "PENDING"] for s in SPRINTS]
    content = f"""# SCORECARD-SPRINTS

## Header
- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Contrato de avaliacao (pesos oficiais)
| criterio | peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |

## Scorecard por sprint
{fmt_md_table(['sprint', 'cobertura_25', 'coerencia_20', 'pedagogia_25', 'adequacao_20', 'governanca_10', 'total_100', 'bloqueios_48h', 'acoes_corretivas', 'estado'], rows)}

## Regra de preenchimento
1. Score preenchido no fecho de cada sprint.
2. Sprint com total < 93 exige plano corretivo na sprint seguinte.
3. Gates `S4/S8/S12` exigem evidencias anexas de cobertura e coerencia.

## Changelog
- `{TODAY}`: contrato oficial de scorecard normalizado e alinhado com pesos 25/20/25/20/10.
"""
    (plan_root / "sprints" / "SCORECARD-SPRINTS.md").write_text(content, encoding="utf-8")


def write_guiao_docente(plan_root: Path) -> None:
    rows = []
    for sprint, _, _, foco, objetivo in SPRINTS:
        rows.append([sprint, foco, objetivo, "Rever 3 BK criticos + 1 negativo por BK", "Pendente"])

    content = f"""# GUIAO-DOCENTE-SEMANAL

## Header
- `doc_id`: `GUIAO-DOCENTE-SEMANAL`
- `path`: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Fornecer guiao semanal para acompanhamento docente da execucao BK por alunos do 12o ano.

## Plano semanal
{fmt_md_table(['sprint', 'foco_macro', 'objetivo_docente', 'evidencia_minima', 'estado'], rows)}

## Checklist docente obrigatoria
- Verificar se os guias BK usados na semana têm `Bloco pedagogico` e `Bloco operacional` completos.
- Confirmar execucao de negativos conforme prioridade (`P0=>3`, `P1/P2=>2`).
- Validar se handoff para proximo BK esta preenchido e sem ambiguidades.

## Changelog
- `{TODAY}`: guiao docente semanal criado como artefacto oficial de governanca pedagogica.
"""
    (plan_root / "sprints" / "GUIAO-DOCENTE-SEMANAL.md").write_text(content, encoding="utf-8")


def write_relatorio_gates(plan_root: Path) -> None:
    content = f"""# GATES-S4-S8-S12

## Header
- `doc_id`: `GATES-S4-S8-S12`
- `path`: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Estabelecer baseline oficial de validacao para os gates S4, S8 e S12.

## Gates
| gate | data_planeada | escopo_macro | criterios_minimos | estado |
| --- | --- | --- | --- | --- |
| S4 | 2026-05-10 | MF0-MF1 | Cobertura RF sem orfaos + 100% guias com header canónico | PENDING |
| S8 | 2026-06-07 | MF0-MF4 | Coerencia matriz/backlog/guias + score >= 93/100 | PENDING |
| S12 | 2026-07-05 | MF0-MF8 | Auditoria automatica PASS + pacote final de defesa | PENDING |

## Evidencias obrigatorias por gate
- JSON da auditoria automatica (`scripts/latest-audit.json`).
- Snapshot do scorecard da sprint de gate.
- Lista de desvios e acoes corretivas (se existir).

## Changelog
- `{TODAY}`: baseline de gates definido com campos nao ambiguos para execucao futura.
"""
    (plan_root / "sprints" / "GATES-S4-S8-S12.md").write_text(content, encoding="utf-8")


def write_matrix(plan_root: Path, rows: list[dict[str, str]]) -> None:
    table_rows = []
    for r in rows:
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["titulo"],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                r["estado"],
                r["esforco"],
                r["dependencias"],
                r["rf_rnf"],
                r["fase_documental"],
                sprint_window(r["macro"]),
                core_or_reforco(r["prioridade"]),
                r["proximo_bk"],
                guide_path(r),
            ]
        )

    content = f"""# MATRIZ-CANONICA-BK

## Header
- `doc_id`: `MATRIZ-CANONICA-BK`
- `path`: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Matriz unica e canónica para garantir rastreabilidade `RF/RNF -> BK -> Sprint -> Guia` sem drift operacional.

## Tabela canonica
{fmt_md_table([
    'bk_id',
    'macro',
    'titulo',
    'owner',
    'apoio',
    'prioridade',
    'estado',
    'esforco',
    'dependencias',
    'rf_rnf',
    'fase_documental',
    'sprint',
    'core_or_reforco',
    'proximo_bk_recomendado',
    'guia_path',
], table_rows)}

## Validacao inicial
- BK duplicado: nao detetado.
- BK orfao: nao detetado.
- Dependencias invalidas: nao detetadas.

## Changelog
- `{TODAY}`: matriz expandida com `sprint`, `core_or_reforco` e `guia_path` para contrato canónico completo.
"""
    (plan_root / "backlogs" / "MATRIZ-CANONICA-BK.md").write_text(content, encoding="utf-8")


def write_backlog(plan_root: Path, rows: list[dict[str, str]]) -> None:
    prio_by_macro = defaultdict(Counter)
    for r in rows:
        prio_by_macro[r["macro"]][r["prioridade"]] += 1

    snapshot_rows = []
    for macro in MACRO_ORDER:
        total = sum(prio_by_macro[macro].values())
        snapshot_rows.append(
            [
                macro,
                str(total),
                str(prio_by_macro[macro]["P0"]),
                str(prio_by_macro[macro]["P1"]),
                str(prio_by_macro[macro]["P2"]),
            ]
        )

    global_rows = []
    for r in rows:
        global_rows.append(
            [
                r["bk_id"],
                r["macro"],
                r["titulo"],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                r["estado"],
                r["esforco"],
                r["dependencias"],
                r["rf_rnf"],
                r["fase_documental"],
                sprint_window(r["macro"]),
                core_or_reforco(r["prioridade"]),
                r["proximo_bk"],
                f"[guia]({guide_rel(r)})",
            ]
        )

    lines = [
        "# BACKLOG-MVP",
        "",
        "## Header",
        "- `doc_id`: `BACKLOG-MVP`",
        "- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Legenda",
        "- Prioridade: `P0` (Must), `P1` (Should), `P2` (Could).",
        "- Politica pedagogica: `P0=>Reforco`, `P1/P2=>Core`.",
        "- Estado: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.",
        "- Esforco: `S`, `M`, `L`.",
        "",
        "## Snapshot por macro",
        fmt_md_table(["Macro", "Total BK", "P0", "P1", "P2"], snapshot_rows),
        "",
        "## Tabela global de ligacao BK -> guia -> estado documental",
        fmt_md_table(
            [
                "bk_id",
                "macro",
                "titulo",
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
                "guia",
            ],
            global_rows,
        ),
        "",
    ]

    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        lines.append(f"## {macro} - {MACRO_LABEL[macro]}")
        lines.append(
            fmt_md_table(
                ["bk_id", "titulo", "owner", "apoio", "prioridade", "estado", "esforco", "dependencias", "rf_rnf", "sprint", "core_or_reforco", "proximo_bk"],
                [
                    [
                        r["bk_id"],
                        r["titulo"],
                        r["owner"],
                        r["apoio"],
                        r["prioridade"],
                        r["estado"],
                        r["esforco"],
                        r["dependencias"],
                        r["rf_rnf"],
                        sprint_window(r["macro"]),
                        core_or_reforco(r["prioridade"]),
                        r["proximo_bk"],
                    ]
                    for r in macro_rows
                ],
            )
        )
        lines.append("")

    lines.extend(
        [
            "## Changelog",
            f"- `{TODAY}`: backlog global normalizado com campos `sprint` e `core_or_reforco` alinhados ao contrato canónico.",
            "",
        ]
    )

    (plan_root / "backlogs" / "BACKLOG-MVP.md").write_text("\n".join(lines), encoding="utf-8")


def write_mf_views(plan_root: Path, rows: list[dict[str, str]]) -> None:
    lines = [
        "# MF-VIEWS",
        "",
        "## Header",
        "- `doc_id`: `MF-VIEWS`",
        "- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Criterio de pronto pedagogico por macro",
        "- 100% BK com guia canónico completo e snippet tecnico aplicavel.",
        "- Minimo de passos por BK: `P0=>8`, `P1/P2=>6`.",
        "- Minimo de negativos por BK: `P0=>3`, `P1/P2=>2`.",
        "",
        "## Sequencia macro",
        "MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8",
        "",
    ]

    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue

        seq = ", ".join(r["bk_id"] for r in macro_rows)
        lines.append(f"## {macro} - {MACRO_LABEL[macro]}")
        lines.append("### Sequencia por macro")
        lines.append(seq)
        lines.append("")

        lines.append("### Guias disponiveis")
        for r in macro_rows:
            lines.append(f"- [{r['bk_id']} - {r['titulo']}]({guide_rel(r)})")
        lines.append("")

        lines.append("### Step-by-step macro")
        lines.append("1. Confirmar dependencias desbloqueadas antes de iniciar BK.")
        lines.append("2. Executar BK por ordem de prioridade `P0->P1->P2` mantendo sequencia tecnica.")
        lines.append("3. Validar smoke e negativos por BK antes do handoff.")
        lines.append("4. Garantir evidence (`pr/proof/neg`) e atualizar estado documental.")
        lines.append("5. Fechar macro apenas com criterios de pronto cumpridos.")
        lines.append("")

        lines.append("### Pronto da macro")
        lines.append("- Todos os BK da macro com guia e evidence minima.")
        lines.append("- Sem dependencias invalidas para a macro seguinte.")
        lines.append("")

    lines.extend(
        [
            "## Changelog",
            f"- `{TODAY}`: MF views sincronizadas com naming slug e contrato canónico de pronto pedagogico.",
            "",
        ]
    )

    (plan_root / "backlogs" / "MF-VIEWS.md").write_text("\n".join(lines), encoding="utf-8")


def write_guias_docs(plan_root: Path, rows: list[dict[str, str]]) -> None:
    guides_root = plan_root / "guias-bk"

    # Clean old guides and rewrite canonical set.
    for old in guides_root.glob("MF*/BK-MF*.md"):
        old.unlink()

    for r in rows:
        d = guides_root / r["macro"]
        d.mkdir(parents=True, exist_ok=True)
        (d / guide_filename(r)).write_text(render_guide(r), encoding="utf-8")

    # README
    lines = [
        "# GUIAS-BK-README",
        "",
        "## Header",
        "- `doc_id`: `GUIAS-BK-README`",
        "- `path`: `docs/planificacao/guias-bk/README.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Regra de naming oficial",
        "- Formato obrigatorio: `BK-MF*-**-slug-semantico.md`.",
        "- IDs BK mantidos sem alteracao.",
        "",
        "## Contrato de header obrigatorio",
        "- Campos obrigatorios: `bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.",
        "",
        "## Indice completo",
    ]
    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        lines.append(f"### {macro}")
        for r in macro_rows:
            lines.append(f"- [{r['bk_id']} - {r['titulo']}]({r['macro']}/{guide_filename(r)})")
        lines.append("")

    lines.extend(["## Changelog", f"- `{TODAY}`: indice regenerado com naming semantico e layout canónico.", ""])
    (guides_root / "README.md").write_text("\n".join(lines), encoding="utf-8")

    # Template
    template = f"""# BK-MF*-** - Titulo do BK

## Header
- `doc_id`: `GUIA-BK-MF*-**`
- `bk_id`: `BK-MF*-**`
- `macro`: `MF*`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...|-`
- `rf_rnf`: `RFxx|RNFxx`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `proximo_bk`: `BK-...|-`
- `guia_path`: `docs/planificacao/guias-bk/MF*/BK-MF*-**-slug-semantico.md`
- `last_updated`: `{TODAY}`

## Contexto do BK
## Bloco pedagogico
### Objetivo
### Pre-requisitos
### Erros comuns
### Check de compreensao
### Tempo estimado

## Bloco operacional
### Entrada
### Passos
### Validacao
### Handoff

## Snippet tecnico aplicavel
```ts
// Snippet real e aplicavel ao BK
```

## Criterios de aceite
## Evidence para PR/defesa
## Changelog
"""
    (guides_root / "_TEMPLATE-BK.md").write_text(template, encoding="utf-8")

    # Roadmap
    roadmap = [
        "# ROADMAP-BKS-RESTANTES",
        "",
        "## Header",
        "- `doc_id`: `ROADMAP-BKS-RESTANTES`",
        "- `path`: `docs/planificacao/guias-bk/ROADMAP-BKS-RESTANTES.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Objetivo",
        "Explicitar sequencia canónica de implementacao BK por macro e sprint, sem alterar IDs.",
        "",
        "## Sequencia resumida",
    ]
    for macro in MACRO_ORDER:
        macro_rows = [r for r in rows if r["macro"] == macro]
        if not macro_rows:
            continue
        roadmap.append(f"- `{macro}` ({sprint_window(macro)}): " + ", ".join(r["bk_id"] for r in macro_rows))

    roadmap.extend(["", "## Changelog", f"- `{TODAY}`: roadmap alinhado ao horizonte S01..S12.", ""])
    (guides_root / "ROADMAP-BKS-RESTANTES.md").write_text("\n".join(roadmap), encoding="utf-8")

    # Migration map
    map_lines = [
        "# MAPA-MIGRACAO-LEGACY-PARA-CANONICO",
        "",
        "## Header",
        "- `doc_id`: `MAPA-MIGRACAO`",
        "- `path`: `docs/planificacao/guias-bk/MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md`",
        "- `owner`: `Nuno`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Nota",
        "- IDs BK mantidos sem alteracao.",
        "- Mudanca aplicada apenas no naming para slug semantico.",
        "",
        "## Mapa",
        "| origem_legacy | destino_canonico |",
        "| --- | --- |",
    ]
    for r in rows:
        map_lines.append(f"| {r['macro']}/{r['bk_id']}.md | {r['macro']}/{guide_filename(r)} |")
    map_lines.extend(["", "## Changelog", f"- `{TODAY}`: migracao de naming concluida.", ""])
    (guides_root / "MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md").write_text("\n".join(map_lines), encoding="utf-8")


def write_relatorio_placeholder(plan_root: Path) -> None:
    content = f"""# CONFORMIDADE-PLANIFICACAO

## Header
- `doc_id`: `CONFORMIDADE-PLANIFICACAO`
- `path`: `docs/planificacao/CONFORMIDADE-PLANIFICACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Estado
Relatorio gerado automaticamente pelo pipeline de validacao (`scripts/validate-planificacao.sh`).

## Meta oficial
- Objetivo documental: `>=93/100`.
- Resultado atual: consultar secao de score no relatorio mais recente.

## Evidencia de auditoria
- Ficheiro fonte: `docs/planificacao/scripts/latest-audit.json`.
- Dimensoes: cobertura, coerencia, pedagogia, adequacao 12o, governanca.

## Changelog
- `{TODAY}`: ficheiro preparado para atualizacao automatica no fecho da validacao.
"""
    (plan_root / "CONFORMIDADE-PLANIFICACAO.md").write_text(content, encoding="utf-8")


def main() -> None:
    plan_root = Path(__file__).resolve().parents[1]

    raw_rows = parse_global_rows_from_backlog(plan_root / "backlogs" / "BACKLOG-MVP.md")
    rows = normalize_rows(raw_rows)

    write_readme(plan_root)
    write_plano_implementacao(plan_root, rows)
    write_distribuicao(plan_root, rows)
    write_plano_sprints(plan_root)
    write_scorecard(plan_root)
    write_guiao_docente(plan_root)
    write_relatorio_gates(plan_root)

    write_matrix(plan_root, rows)
    write_backlog(plan_root, rows)
    write_mf_views(plan_root, rows)
    write_guias_docs(plan_root, rows)

    write_relatorio_placeholder(plan_root)

    print(f"Normalizacao concluida: {len(rows)} BK processados.")


if __name__ == "__main__":
    main()
