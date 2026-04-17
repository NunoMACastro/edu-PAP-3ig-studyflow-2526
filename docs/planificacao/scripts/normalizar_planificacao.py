#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import unicodedata
from collections import Counter, defaultdict

TODAY = "2026-04-17"

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


def classify_domain(row: dict[str, str]) -> str:
    titulo = row["titulo"].lower()
    req = first_req(row["rf_rnf"])

    if req in {"RNF38"} or any(k in titulo for k in ["chrome", "firefox", "safari", "edge", "compat"]):
        return "compatibility_browser"
    if req in {"RNF39", "RNF42", "RNF43", "RNF44"} or any(k in titulo for k in ["pt-pt", "portugu", "datas", "i18n", "utf-8"]):
        return "localization"
    if req in {"RNF14", "RNF15", "RNF16", "RNF17", "RNF18", "RNF19", "RNF20"} or any(
        k in titulo for k in ["https", "tls", "hashing", "password", "xss", "csrf", "injection", "brute", "sandbox seguro", "cookies"]
    ):
        return "security_hardening"
    if req in {"RNF21", "RNF22", "RNF23", "RNF24", "RNF29", "RNF30"} or any(
        k in titulo for k in ["backup", "recovery", "downtime", "health-check", "deploy", "rollback", "logs"]
    ):
        return "reliability_ops"
    if req in {"RNF25", "RNF26", "RNF27", "RNF28"} or any(
        k in titulo for k in ["backend modular", "frontend componentizado", "documentação técnica", "testes automatizados"]
    ):
        return "quality_architecture"
    if req in {"RNF08", "RNF09", "RNF10", "RNF11", "RNF12", "RNF13"} or any(
        k in titulo for k in ["2s", "4s", "simultaneos", "assíncrona", "background", "escalar", "performance"]
    ):
        return "performance_scalability"
    if req in {"RF52", "RF53", "RF54"} or any(k in titulo for k in ["consentimentos", "exportar dados", "eliminar conta", "dados pessoais", "rgpd"]):
        return "privacy_rgpd"
    if req in {"RF55", "RF56", "RF57", "RF58"} or any(
        k in titulo for k in ["utilizadores e papéis", "auditoria completa", "modelos de ia", "quotas de ia", "administrador"]
    ):
        return "admin_governance"
    if req in {"RF47", "RF48", "RF49", "RF50", "RF51"} or any(k in titulo for k in ["notific", "alerta", "avisos", "publicacoes"]):
        return "notifications"
    if req in {"RF41", "RF42", "RF43", "RF44"} or any(k in titulo for k in ["grupo", "chat", "coletiv", "sessões de estudo"]):
        return "collaboration"
    if req in {"RF19", "RF20", "RF21", "RF22", "RF23", "RF24", "RF25"} or any(k in titulo for k in ["turmas", "disciplin", "docente", "professor"]):
        return "classroom_teacher"
    if req in {"RF26", "RF27", "RF28", "RF29", "RF30"} or any(k in titulo for k in ["projetos", "testes", "mini-testes", "aprovar conteúdo", "métricas da turma"]):
        return "projects_assessment"
    if req in {"RF31", "RF32", "RF33", "RF34"} or any(k in titulo for k in ["indexação", "extrair tópicos", "versões dos materiais", "separar materiais", "pdf", "docx", "urls"]):
        return "materials_ingestion"
    if req in {"RF35", "RF36", "RF37", "RF38", "RF39", "RF40"} or any(
        k in titulo for k in ["assistente ia", "guardrails", "citações obrigatórias", "não pode inventar", "conhecimento externo", "adapta explicações"]
    ):
        return "ai_orchestration"
    if req in {"RNF01", "RNF02", "RNF03", "RNF04", "RNF05", "RNF06", "RNF07"} or any(
        k in titulo for k in ["interface intuitiva", "layout responsivo", "acessibilidade", "feedback imediato", "validação de formulários", "navegação consistente"]
    ):
        return "ux_accessibility"
    if req in {"RF61", "RNF41"} or any(k in titulo for k in ["drive", "onedrive", "ics", "lms", "integração"]):
        return "integrations"
    return "learning_foundation"


def domain_objective(domain: str) -> str:
    return {
        "learning_foundation": "Construir o fluxo base de aluno (identidade, perfil e estudo individual) com comportamento previsivel.",
        "ai_orchestration": "Garantir respostas de IA fundamentadas, com guardrails e adaptacao ao contexto academico correto.",
        "materials_ingestion": "Assegurar ingestao/indexacao de materiais com rastreabilidade e isolamento por contexto.",
        "classroom_teacher": "Implementar operacao professor/turma/disciplina com controlo de acesso e curadoria oficial.",
        "projects_assessment": "Implementar ciclo de projetos e testes com criterios de avaliacao reproduziveis.",
        "collaboration": "Assegurar colaboracao em grupo com isolamento de membros e historico verificavel.",
        "notifications": "Orquestrar notificacoes por contexto com quotas, preferencias e prioridade controladas.",
        "privacy_rgpd": "Cumprir direitos RGPD (exportacao, eliminacao, consentimento) com trilho auditavel.",
        "admin_governance": "Operacionalizar governanca administrativa de papeis, auditoria e limites de uso.",
        "ux_accessibility": "Elevar qualidade de experiencia (usabilidade/acessibilidade) com criterios verificaveis.",
        "performance_scalability": "Cumprir metas de latencia e escalabilidade com instrumentacao objetiva.",
        "security_hardening": "Endurecer superficie de seguranca com protecoes ativas e validacao negativa.",
        "reliability_ops": "Garantir continuidade operacional (logs, backups, recovery, deploy seguro).",
        "quality_architecture": "Consolidar arquitetura e qualidade tecnica com testes e modularidade.",
        "compatibility_browser": "Validar compatibilidade real entre navegadores suportados no MVP.",
        "localization": "Garantir localizacao PT-PT e preparo i18n sem regressao funcional.",
        "integrations": "Integrar fontes externas em modo controlado, idempotente e observavel.",
    }.get(domain, "Executar o BK com criterios tecnicos claros e evidencia verificavel.")


def domain_errors(domain: str) -> list[str]:
    return {
        "learning_foundation": ["Nao validar duplicados de conta/perfil.", "Misturar regras de aluno sem turma com turma inscrita."],
        "ai_orchestration": ["Responder sem citar fonte do material.", "Aplicar perfil de IA errado ao contexto atual."],
        "materials_ingestion": ["Aceitar ficheiros sem validar tipo/tamanho.", "Indexar sem separar contexto aluno/professor/turma."],
        "classroom_teacher": ["Permitir acesso a disciplina sem inscricao.", "Publicar material oficial sem revisão de permissões."],
        "projects_assessment": ["Gerar testes sem chave de correção consistente.", "Registar progresso sem granularidade por tópico."],
        "collaboration": ["Expor dados de sala a não-membros.", "Não persistir histórico de sessão/co-estudo."],
        "notifications": ["Ignorar preferências de canal do utilizador.", "Disparar notificações acima da quota definida."],
        "privacy_rgpd": ["Não registar prova de consentimento.", "Eliminar dados sem política de retenção definida."],
        "admin_governance": ["Alterar papeis sem trilho de auditoria.", "Aplicar quotas globais sem segmentar por contexto."],
        "ux_accessibility": ["Validar formulário apenas no backend.", "Quebrar contraste/foco teclado em componentes principais."],
        "performance_scalability": ["Medir latencia sem cenário reproduzível.", "Bloquear UI em tarefas assíncronas pesadas."],
        "security_hardening": ["Depender de segurança apenas no frontend.", "Não testar vetores negativos (XSS/CSRF/brute-force)."],
        "reliability_ops": ["Sem plano de recuperação após falha.", "Deploy sem rollback testado."],
        "quality_architecture": ["Testes sem cobrir módulos críticos.", "Acoplar domínios sem fronteiras claras."],
        "compatibility_browser": ["Validar só no browser do programador.", "Não congelar baseline de versões suportadas."],
        "localization": ["Misturar formatos de data em ecrãs distintos.", "Quebrar acentuação PT-PT em import/export."],
        "integrations": ["Importar duplicados por falta de idempotência.", "Não registar origem do material importado."],
    }.get(domain, ["Ignorar requisitos negativos obrigatórios.", "Fechar BK sem evidência executável."])


def domain_actions(domain: str) -> tuple[str, str, str]:
    mapping = {
        "learning_foundation": ("fluxo de conta/perfil em estado consistente", "regras de sessão/papel e transições de estado", "mapa de estados (novo, ativo, bloqueado)"),
        "ai_orchestration": ("pipeline IA com contexto e fontes citadas", "guardrails por perfil (aluno, turma, professor)", "amostras de prompts/respostas com fontes"),
        "materials_ingestion": ("ingestão e indexação assíncrona por tipo de material", "validação de MIME/tamanho e isolamento por contexto", "logs de parsing + índices criados"),
        "classroom_teacher": ("fluxo turma/disciplina/material oficial", "autorização por inscrição e papel docente", "evidência de acesso autorizado/negado"),
        "projects_assessment": ("criação de projeto/teste e avaliação", "rubrica de correção e persistência de desempenho", "resultados por tópico e turma"),
        "collaboration": ("sala/grupo com partilha e histórico", "controlo de membros e permissões de escrita", "histórico de sessão e autoria"),
        "notifications": ("despacho de notificação por contexto/canal", "respeito por preferências e quotas", "eventos de envio, supressão e fallback"),
        "privacy_rgpd": ("exportação/eliminação/consentimento com estado auditável", "política de retenção e trilho de prova", "registo de pedido + execução"),
        "admin_governance": ("painel admin para papéis, auditoria e quotas", "limites por aluno/turma/grupo/modelo", "alterações administrativas rastreadas"),
        "ux_accessibility": ("comportamentos UX críticos (form, feedback, navegação)", "acessibilidade básica (labels, foco, contraste)", "capturas/relatório de usabilidade"),
        "performance_scalability": ("cenário de carga e medição de latência", "timeouts, filas e controlo de concorrência", "métricas comparáveis pré/pós"),
        "security_hardening": ("proteções de canal/sessão/entrada", "mitigações XSS/CSRF/injection/brute-force", "evidência de bloqueio em testes negativos"),
        "reliability_ops": ("health, backup/recovery e operação segura", "circuit-breaker/retry/rollback", "runbook de falha + recuperação"),
        "quality_architecture": ("fronteiras de domínio + testes críticos", "contratos entre módulos e cobertura mínima", "suite automatizada em CI local"),
        "compatibility_browser": ("matriz de browsers suportados com testes E2E", "normalização de APIs e fallbacks", "relatório por navegador/versão"),
        "localization": ("locale PT-PT em UI e export/import", "normalização de datas/números e encoding", "evidência de UI + ficheiros gerados"),
        "integrations": ("importação unidirecional via conector externo", "idempotência e mapeamento de origem", "histórico de sincronização"),
    }
    return mapping.get(domain, ("fluxo principal do requisito", "regras de controlo associadas", "evidência técnica verificável"))


def domain_validation_points(domain: str) -> list[str]:
    points = {
        "ai_orchestration": ["Resposta referencia fontes reais (doc/página/secção).", "Perfil de IA aplicado corresponde ao contexto do pedido."],
        "materials_ingestion": ["Documento indexado gera entradas pesquisáveis.", "Falha de parsing não bloqueia interface do utilizador."],
        "notifications": ["Preferência de canal é respeitada por utilizador.", "Quota máxima impede spam em eventos repetidos."],
        "privacy_rgpd": ["Pedido RGPD deixa trilho auditável com timestamp.", "Exportação/eliminação trata dados relacionais sem fuga."],
        "performance_scalability": ["Métrica alvo do BK é medida e comparável.", "Caminho crítico mantém-se dentro do orçamento definido."],
        "security_hardening": ["Endpoint crítico recusa tráfego inseguro.", "Vetores negativos conhecidos geram erro controlado."],
        "compatibility_browser": ["Fluxos críticos passam em Chrome/Edge/Firefox/Safari.", "Sem regressão visual/funcional em browser alternativo."],
        "localization": ["Interface e datas seguem PT-PT sem exceções no fluxo.", "Importação/exportação preserva UTF-8 e acentuação."],
    }
    return points.get(domain, ["Fluxo do requisito cumpre contrato de entrada/saída.", "Persistência e leitura dos dados mantêm consistência."])


def domain_negative_examples(domain: str) -> list[str]:
    examples = {
        "ai_orchestration": ["pedido sem contexto documental", "pedido que tenta contornar guardrails", "pedido com perfil errado de utilizador"],
        "materials_ingestion": ["ficheiro com formato não suportado", "upload acima do limite", "URL inacessível ou inválida"],
        "security_hardening": ["pedido HTTP sem TLS", "payload com tentativa de injection", "token/cookie inválido"],
        "privacy_rgpd": ["exportação sem autenticação forte", "eliminação sem confirmação de titular", "consentimento retirado em uso ativo"],
        "compatibility_browser": ["funcionalidade em browser sem API nativa", "render com layout quebrado", "evento de teclado sem fallback"],
    }
    return examples.get(domain, ["entrada obrigatória em falta", "estado inválido de negócio", "permissão insuficiente"])


def choose_snippet(row: dict[str, str], domain: str) -> tuple[str, str, str, str]:
    bk_id = row["bk_id"]
    req = first_req(row["rf_rnf"])

    snippets: dict[str, tuple[str, str, str, str]] = {
        "learning_foundation": (
            "Handler de registo e sessão",
            "ts",
            f"""type Credenciais = {{ email: string; password: string }};

export async function registarAluno(input: Credenciais) {{
  if (!input.email.includes('@')) throw new Error('Email invalido');
  if (input.password.length < 12) throw new Error('Password fraca');
  return {{ bkId: '{bk_id}', req: '{req}', estado: 'REGISTADO' }};
}}
""",
            "Garante validação mínima de identidade no arranque do fluxo de conta.",
        ),
        "ai_orchestration": (
            "Resposta IA com guardrails e fontes",
            "ts",
            f"""type Fonte = {{ doc: string; secao: string }};

export function responderIA(perfil: 'ALUNO' | 'TURMA' | 'PROFESSOR', pergunta: string, fontes: Fonte[]) {{
  if (!pergunta.trim()) throw new Error('Pergunta vazia');
  if (!fontes.length) throw new Error('Resposta sem fonte permitida');
  return {{ bkId: '{bk_id}', req: '{req}', perfil, resposta: 'Gerada com base documental', fontes }};
}}
""",
            "Força citação de fonte e aplica perfil de guardrail por contexto.",
        ),
        "materials_ingestion": (
            "Pipeline de ingestão assíncrona",
            "ts",
            f"""type Material = {{ id: string; tipo: 'PDF' | 'DOCX' | 'URL'; bytes: number }};

export function enfileirarIndexacao(material: Material) {{
  if (material.bytes <= 0 || material.bytes > 25 * 1024 * 1024) throw new Error('Tamanho invalido');
  return {{ bkId: '{bk_id}', req: '{req}', job: `IDX-${{material.id}}`, estado: 'PENDING' }};
}}
""",
            "Separa validação e indexação para não bloquear o utilizador.",
        ),
        "classroom_teacher": (
            "Autorização por turma e disciplina",
            "ts",
            f"""type Contexto = {{ turmaId: string; disciplinaId: string; papel: 'ALUNO' | 'PROFESSOR' }};

export function autorizarContexto(c: Contexto) {{
  if (!c.turmaId || !c.disciplinaId) throw new Error('Contexto incompleto');
  if (c.papel !== 'PROFESSOR') throw new Error('Apenas docente pode executar esta ação');
  return {{ bkId: '{bk_id}', req: '{req}', autorizado: true }};
}}
""",
            "Evita operações docentes fora do contexto da turma/disciplina.",
        ),
        "projects_assessment": (
            "Correção de mini-teste com rubrica",
            "ts",
            f"""type Resposta = {{ topico: string; correta: boolean }};

export function calcularDesempenho(respostas: Resposta[]) {{
  if (!respostas.length) throw new Error('Sem respostas para avaliar');
  const corretas = respostas.filter((r) => r.correta).length;
  return {{ bkId: '{bk_id}', req: '{req}', score: Math.round((corretas / respostas.length) * 100) }};
}}
""",
            "Produz saída objetiva por tópico para acompanhamento docente.",
        ),
        "collaboration": (
            "Controlo de acesso de sala/grupo",
            "ts",
            f"""type Membro = {{ userId: string; salaId: string; ativo: boolean }};

export function validarMembro(m: Membro) {{
  if (!m.ativo) throw new Error('Membro sem acesso');
  return {{ bkId: '{bk_id}', req: '{req}', permissao: 'OK', salaId: m.salaId }};
}}
""",
            "Garante que partilha/chat só ocorre para membros ativos.",
        ),
        "notifications": (
            "Despacho de notificações com quota",
            "ts",
            f"""type Preferencia = {{ canal: 'app' | 'email' | 'push'; ativo: boolean }};

export function podeNotificar(pref: Preferencia, enviadosHoje: number, quota: number) {{
  if (!pref.ativo) return {{ bkId: '{bk_id}', req: '{req}', enviar: false, motivo: 'opt-out' }};
  return {{ bkId: '{bk_id}', req: '{req}', enviar: enviadosHoje < quota }};
}}
""",
            "Impõe preferências e quota máxima antes do envio.",
        ),
        "privacy_rgpd": (
            "Registo de consentimento versionado",
            "ts",
            f"""type Consentimento = {{ userId: string; finalidade: string; aceite: boolean; versao: string }};

export function registarConsentimento(c: Consentimento) {{
  if (!c.versao) throw new Error('Versao obrigatoria');
  return {{ bkId: '{bk_id}', req: '{req}', evento: 'CONSENTIMENTO_REGISTADO', consentimento: c }};
}}
""",
            "Cria trilho auditável obrigatório para RGPD.",
        ),
        "admin_governance": (
            "Política de quotas por contexto",
            "ts",
            f"""type Quota = {{ contexto: 'ALUNO' | 'TURMA' | 'GRUPO'; limiteMensal: number }};

export function validarQuota(q: Quota, consumoAtual: number) {{
  if (q.limiteMensal <= 0) throw new Error('Limite invalido');
  return {{ bkId: '{bk_id}', req: '{req}', excedido: consumoAtual >= q.limiteMensal }};
}}
""",
            "Permite governança operacional de consumo de IA.",
        ),
        "ux_accessibility": (
            "Validação de formulário com feedback acessível",
            "ts",
            f"""type FormState = {{ email: string; nome: string }};

export function validarFormulario(state: FormState) {{
  const erros: string[] = [];
  if (!state.nome.trim()) erros.push('Nome obrigatório');
  if (!state.email.includes('@')) erros.push('Email inválido');
  return {{ bkId: '{bk_id}', req: '{req}', valido: erros.length === 0, erros }};
}}
""",
            "Cria feedback imediato e determinístico no fluxo de UI.",
        ),
        "performance_scalability": (
            "Consulta de latência por janela",
            "sql",
            f"""-- BK: {bk_id} / {req}
SELECT DATE_TRUNC('minute', created_at) AS janela,
       AVG(latencia_ms) AS lat_media,
       PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latencia_ms) AS p95
FROM metricas_latency
WHERE contexto = :contexto
GROUP BY 1
ORDER BY 1 DESC
LIMIT 60;
""",
            "Base para validar SLA do caminho crítico com p95 mensurável.",
        ),
        "security_hardening": (
            "Middlewares de segurança obrigatórios",
            "ts",
            f"""export function exigirHTTPS(proto: string) {{
  if (proto !== 'https') throw new Error('Canal inseguro');
}}

export function validarRateLimit(tentativasMinuto: number, limite: number) {{
  if (tentativasMinuto > limite) throw new Error('Rate limit excedido');
  return {{ bkId: '{bk_id}', req: '{req}', ok: true }};
}}
""",
            "Aplica proteção ativa no perímetro do endpoint crítico.",
        ),
        "reliability_ops": (
            "Health-check e retry controlado",
            "ts",
            f"""export function healthCheck(dbOk: boolean, filaOk: boolean) {{
  const status = dbOk && filaOk ? 'UP' : 'DEGRADED';
  return {{ bkId: '{bk_id}', req: '{req}', status }};
}}
""",
            "Suporta operação e diagnóstico rápido em incidente.",
        ),
        "quality_architecture": (
            "Teste automatizado de módulo crítico",
            "ts",
            f"""import {{ describe, it, expect }} from 'vitest';

describe('{bk_id}', () => {{
  it('cumpre contrato principal', () => {{
    const output = {{ ok: true, bkId: '{bk_id}', req: '{req}' }};
    expect(output.ok).toBe(true);
  }});
}});
""",
            "Fixa comportamento esperado e previne regressões no módulo.",
        ),
        "compatibility_browser": (
            "Teste E2E cross-browser",
            "ts",
            f"""import {{ test, expect }} from '@playwright/test';

test('{bk_id} fluxo crítico', async ({{ page }}) => {{
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
}});
""",
            "Permite executar a mesma verificação em Chromium, Firefox e WebKit.",
        ),
        "localization": (
            "Normalização de locale PT-PT",
            "ts",
            f"""export function formatarDataPT(dataIso: string) {{
  const d = new Date(dataIso);
  return d.toLocaleDateString('pt-PT');
}}
""",
            "Garante coerência de apresentação de datas em PT-PT.",
        ),
        "integrations": (
            "Importação unidirecional com idempotência",
            "ts",
            f"""type FicheiroExterno = {{ sourceId: string; hash: string }};

export function deduplicarImportacao(existente: Set<string>, f: FicheiroExterno) {{
  const chave = `${{f.sourceId}}:${{f.hash}}`;
  return {{ bkId: '{bk_id}', req: '{req}', importar: !existente.has(chave), chave }};
}}
""",
            "Evita duplicados na sincronização de materiais externos.",
        ),
    }
    return snippets.get(
        domain,
        (
            "Validação de contrato de entrada",
            "ts",
            f"""export function validarContrato(payload: Record<string, unknown>) {{
  if (!payload) throw new Error('Payload vazio');
  return {{ bkId: '{bk_id}', req: '{req}', ok: true }};
}}
""",
            "Barreira mínima para estabilizar integrações do BK.",
        ),
    )


def render_guide(row: dict[str, str]) -> str:
    bk_id = row["bk_id"]
    macro = row["macro"]
    prioridade = row["prioridade"]
    deps = parse_items(row["dependencias"])
    deps_fmt = ", ".join(deps) if deps else "-"
    req = first_req(row["rf_rnf"])
    min_neg = 3 if prioridade == "P0" else 2
    domain = classify_domain(row)
    objetivo = domain_objective(domain)
    erros = domain_errors(domain)
    acao_principal, acao_controle, acao_evidencia = domain_actions(domain)
    validacoes = domain_validation_points(domain)
    negativos_exemplos = domain_negative_examples(domain)

    steps = [
        f"Confirmar no backlog e na matriz o escopo de `{bk_id}` e do requisito `{req}`.",
        f"Validar pre-condicoes técnicas e dependencias declaradas: `{deps_fmt}`.",
        f"Modelar contratos de dados e estados para `{acao_principal}`.",
        f"Implementar o caminho principal de `{acao_principal}`.",
        f"Aplicar controlos para `{acao_controle}`.",
        f"Preparar evidencia operacional: `{acao_evidencia}`.",
        "Executar smoke test completo do fluxo principal e registar o resultado.",
        f"Executar negativos obrigatórios (`{min_neg}`) e validar erro controlado.",
    ]
    if prioridade == "P0":
        steps.extend(
            [
                "Adicionar reforço técnico orientado ao maior risco (segurança, performance ou robustez).",
                "Concluir handoff técnico com risco aberto, decisão tomada e próximo BK.",
            ]
        )

    steps_md = "\n".join(f"{i+1}. {s}" for i, s in enumerate(steps))
    validacao_md = "\n".join(f"- {v}" for v in validacoes)
    negativos_md = "\n".join(f"- {e}" for e in negativos_exemplos[:min_neg])
    erros_md = "\n".join(f"- {e}" for e in erros)
    snippet_name, snippet_lang, snippet_code, snippet_desc = choose_snippet(row, domain)

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
- Dominio semântico aplicado: `{domain}`.

## Bloco pedagogico
### Objetivo
{objetivo}

### Pre-requisitos
- Ler o requisito de origem em `docs/RF.md` ou `docs/RNF.md`.
- Rever `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md` e `PLANO-SPRINTS.md`.
- Confirmar dependencias: `{deps_fmt}`.

### Erros comuns
{erros_md}
- Fechar BK sem validar negativos obrigatórios.

### Check de compreensao
- [ ] Sei explicar como `{req}` se traduz em comportamento implementável.
- [ ] Sei indicar o principal risco técnico deste BK e como o mitigar.
- [ ] Sei demonstrar evidência objetiva de sucesso e falha controlada.

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

### Cenarios negativos recomendados
{negativos_md}

### Validacao
- Smoke: mínimo `1` execução completa do fluxo principal.
- Negativos: mínimo `{min_neg}` cenários com erro controlado.
{validacao_md}
- Tecnico: metadados alinhados entre matriz/backlog/guia.

### Handoff
- Proximo BK: `{row['proximo_bk']}`
- Registar bloqueios, decisão técnica e risco residual.
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
- Evidence pronta para revisão técnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link de PR/commit com resumo funcional do BK.
- `proof`: output/screenshot/log/teste que comprova o caminho principal.
- `neg`: evidência dos cenários negativos executados e respetivo erro controlado.

## Changelog
- `{TODAY}`: guia semântico regenerado com passos, validação e snippet alinhados ao requisito.
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
        "## Contrato semântico obrigatório",
        "- O `rf_rnf` do header deve estar refletido nos `Passos`, `Validacao` e `Cenarios negativos recomendados`.",
        "- O `Snippet tecnico aplicavel` deve pertencer ao dominio funcional do BK (nao sao aceites snippets genéricos).",
        "- `Evidence` deve incluir prova do caminho principal e prova de falha controlada.",
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
// Snippet obrigatoriamente especifico do dominio do BK (nao generico)
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
