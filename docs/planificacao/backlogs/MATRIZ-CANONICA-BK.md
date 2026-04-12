# MATRIZ-CANONICA-BK

## Header
- `doc_id`: `MATRIZ-CANONICA-BK`
- `path`: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Objetivo
Matriz única validada para gerar backlog, MF views, sprints e guias BK sem ambiguidades.

## Tabela canónica
| bk_id | macro | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf | slug_alvo | fase_documental | próximo_bk_recomendado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | Registo do aluno (email/password ou SSO escolar). | Guilherme | Natália | P0 | TODO | S | - | RF01 | registo-do-aluno-email-password-ou-sso-escolar | Fase 1 | BK-MF0-02 |
| BK-MF0-02 | MF0 | Login seguro com cookies HttpOnly. | Guilherme | Natália | P0 | TODO | S | - | RF02 | login-seguro-com-cookies-httponly | Fase 1 | BK-MF0-03 |
| BK-MF0-03 | MF0 | Perfil editável (nome, ano, curso, turma). | Daniel | Kaua | P1 | TODO | M | BK-MF0-02 | RF03 | perfil-editavel-nome-ano-curso-turma | Fase 1 | BK-MF0-04 |
| BK-MF0-04 | MF0 | O aluno pode estudar sem turma. | Guilherme | Natália | P0 | TODO | M | BK-MF0-03 | RF04 | o-aluno-pode-estudar-sem-turma | Fase 1 | BK-MF0-05 |
| BK-MF0-05 | MF0 | O aluno pode criar rotinas e objetivos de estudo. | Daniel | Kaua | P1 | TODO | M | BK-MF0-03 | RF05 | o-aluno-pode-criar-rotinas-e-objetivos-de-estudo | Fase 1 | BK-MF0-06 |
| BK-MF0-06 | MF0 | O aluno pode consultar histórico de estudo. | Daniel | Kaua | P1 | TODO | M | BK-MF0-03 | RF06 | o-aluno-pode-consultar-historico-de-estudo | Fase 1 | BK-MF0-07 |
| BK-MF0-07 | MF0 | Interface intuitiva e clara para alunos e professores. | Guilherme | Natália | P0 | TODO | S | - | RNF01 | interface-intuitiva-e-clara-para-alunos-e-professores | Fase 1 | BK-MF0-08 |
| BK-MF0-08 | MF0 | Layout responsivo para desktop/tablet/mobile. | Guilherme | Natália | P0 | TODO | S | - | RNF02 | layout-responsivo-para-desktop-tablet-mobile | Fase 1 | BK-MF0-09 |
| BK-MF0-09 | MF0 | Feedback imediato em ações (guardar, IA, uploads). | Guilherme | Natália | P0 | TODO | S | - | RNF03 | feedback-imediato-em-acoes-guardar-ia-uploads | Fase 1 | BK-MF0-10 |
| BK-MF0-10 | MF0 | Navegação consistente entre módulos. | Daniel | Kaua | P1 | TODO | S | - | RNF04 | navegacao-consistente-entre-modulos | Fase 1 | BK-MF0-11 |
| BK-MF0-11 | MF0 | Regras básicas de acessibilidade (contraste, labels). | Daniel | Kaua | P1 | TODO | S | - | RNF05 | regras-basicas-de-acessibilidade-contraste-labels | Fase 1 | BK-MF0-12 |
| BK-MF0-12 | MF0 | Validação completa de formulários antes de submissão. | Guilherme | Natália | P0 | TODO | S | - | RNF06 | validacao-completa-de-formularios-antes-de-submissao | Fase 1 | BK-MF0-13 |
| BK-MF0-13 | MF0 | Notificações discretas e contextualizadas. | Daniel | Kaua | P1 | TODO | S | - | RNF07 | notificacoes-discretas-e-contextualizadas | Fase 1 | BK-MF0-14 |
| BK-MF0-14 | MF0 | Backend modular por domínios (aluno, professor, IA, materiais). | Guilherme | Natália | P0 | TODO | L | - | RNF25 | backend-modular-por-dominios-aluno-professor-ia-materiais | Fase 1 | BK-MF0-15 |
| BK-MF0-15 | MF0 | Frontend componentizado e reutilizável. | Guilherme | Natália | P0 | TODO | S | - | RNF26 | frontend-componentizado-e-reutilizavel | Fase 1 | BK-MF0-16 |
| BK-MF0-16 | MF0 | Documentação técnica mínima (modelos, fluxos, endpoints). | Daniel | Kaua | P1 | TODO | S | - | RNF27 | documentacao-tecnica-minima-modelos-fluxos-endpoints | Fase 1 | BK-MF0-17 |
| BK-MF0-17 | MF0 | Interface em português (Portugal). | Guilherme | Natália | P0 | TODO | S | - | RNF42 | interface-em-portugues-portugal | Fase 1 | BK-MF0-18 |
| BK-MF0-18 | MF0 | Datas no formato dd/mm/aaaa. | Guilherme | Natália | P0 | TODO | S | - | RNF43 | datas-no-formato-dd-mm-aaaa | Fase 1 | BK-MF0-19 |
| BK-MF0-19 | MF0 | Preparado para futura tradução i18n. | Daniel | Kaua | P2 | TODO | S | - | RNF44 | preparado-para-futura-traducao-i18n | Fase 1 | BK-MF1-01 |
| BK-MF1-01 | MF1 | Criar “Áreas de Estudo” (auto-disciplina independente). | Guilherme | Natália | P0 | TODO | M | BK-MF0-03 | RF07 | criar-areas-de-estudo-auto-disciplina-independente | Fase 1 | BK-MF1-02 |
| BK-MF1-02 | MF1 | Submeter materiais (PDF, DOCX, URLs, tópicos). | Guilherme | Natália | P0 | TODO | M | BK-MF1-01 | RF08 | submeter-materiais-pdf-docx-urls-topicos | Fase 1 | BK-MF1-03 |
| BK-MF1-03 | MF1 | Associar estilo/tom das aulas → “voz” da IA. | Kaua | Guilherme | P1 | TODO | M | BK-MF1-01 | RF09 | associar-estilo-tom-das-aulas-voz-da-ia | Fase 1 | BK-MF1-04 |
| BK-MF1-04 | MF1 | Criar perfil IA da Área de Estudo. | Guilherme | Natália | P0 | TODO | M | BK-MF1-02 | RF10 | criar-perfil-ia-da-area-de-estudo | Fase 1 | BK-MF1-05 |
| BK-MF1-05 | MF1 | Obter resumos IA baseados nos materiais enviados. | Guilherme | Natália | P0 | TODO | M | BK-MF1-02, BK-MF1-04 | RF11 | obter-resumos-ia-baseados-nos-materiais-enviados | Fase 1 | BK-MF1-06 |
| BK-MF1-06 | MF1 | Obter explicações, cards e quizzes personalizados. | Guilherme | Natália | P0 | TODO | M | BK-MF1-05 | RF12 | obter-explicacoes-cards-e-quizzes-personalizados | Fase 1 | BK-MF1-07 |
| BK-MF1-07 | MF1 | A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | Kaua | Guilherme | P1 | TODO | M | BK-MF1-05 | RF13 | a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno | Fase 1 | BK-MF1-08 |
| BK-MF1-08 | MF1 | IA adapta explicações ao nível do aluno. | Kaua | Guilherme | P1 | TODO | S | - | RNF36 | ia-adapta-explicacoes-ao-nivel-do-aluno | Fase 1 | BK-MF2-01 |
| BK-MF2-01 | MF2 | Indexação automática de PDFs, DOCX e URLs. | Natália | Guilherme | P0 | TODO | M | BK-MF1-02, BK-MF3-03 | RF31 | indexacao-automatica-de-pdfs-docx-e-urls | Fase 1 | BK-MF2-02 |
| BK-MF2-02 | MF2 | Extrair tópicos, secções, estrutura e referências. | Natália | Guilherme | P0 | TODO | M | BK-MF2-01 | RF32 | extrair-topicos-seccoes-estrutura-e-referencias | Fase 1 | BK-MF2-03 |
| BK-MF2-03 | MF2 | Manter versões dos materiais. | Guilherme | Natália | P1 | TODO | M | BK-MF2-01 | RF33 | manter-versoes-dos-materiais | Fase 1 | BK-MF2-04 |
| BK-MF2-04 | MF2 | Separar materiais entre “aluno”, “professor” e “turma”. | Natália | Guilherme | P0 | TODO | M | BK-MF2-01 | RF34 | separar-materiais-entre-aluno-professor-e-turma | Fase 1 | BK-MF2-05 |
| BK-MF2-05 | MF2 | Assistente IA privado por Área de Estudo. | Natália | Guilherme | P0 | TODO | M | BK-MF1-04 | RF35 | assistente-ia-privado-por-area-de-estudo | Fase 1 | BK-MF2-06 |
| BK-MF2-06 | MF2 | Assistente IA da disciplina/turma com voz docente. | Natália | Guilherme | P0 | TODO | M | BK-MF3-04 | RF36 | assistente-ia-da-disciplina-turma-com-voz-docente | Fase 1 | BK-MF2-07 |
| BK-MF2-07 | MF2 | Guardrails distintos para aluno solo, grupo e turma. | Natália | Guilherme | P0 | TODO | L | BK-MF2-05 | RF37 | guardrails-distintos-para-aluno-solo-grupo-e-turma | Fase 1 | BK-MF2-08 |
| BK-MF2-08 | MF2 | IA não pode inventar conteúdo (citações obrigatórias). | Natália | Guilherme | P0 | TODO | M | BK-MF2-01 | RF38 | ia-nao-pode-inventar-conteudo-citacoes-obrigatorias | Fase 1 | BK-MF2-09 |
| BK-MF2-09 | MF2 | IA pode recorrer a conhecimento externo (limitado) quando permitido. | Guilherme | Natália | P1 | TODO | M | BK-MF2-05 | RF39 | ia-pode-recorrer-a-conhecimento-externo-limitado-quando-permitido | Fase 1 | BK-MF2-10 |
| BK-MF2-10 | MF2 | IA deve ajustar explicações ao perfil do aluno. | Guilherme | Natália | P1 | TODO | M | BK-MF1-07 | RF40 | ia-deve-ajustar-explicacoes-ao-perfil-do-aluno | Fase 1 | BK-MF2-11 |
| BK-MF2-11 | MF2 | Indexação de documentos deve ser assíncrona e não bloquear UI. | Natália | Guilherme | P0 | TODO | L | - | RNF11 | indexacao-de-documentos-deve-ser-assincrona-e-nao-bloquear-ui | Fase 1 | BK-MF2-12 |
| BK-MF2-12 | MF2 | Processamento de documentos em sandbox seguro. | Natália | Guilherme | P0 | TODO | L | - | RNF18 | processamento-de-documentos-em-sandbox-seguro | Fase 1 | BK-MF2-13 |
| BK-MF2-13 | MF2 | Guardrails obrigatórios na IA. | Natália | Guilherme | P0 | TODO | L | - | RNF19 | guardrails-obrigatorios-na-ia | Fase 1 | BK-MF2-14 |
| BK-MF2-14 | MF2 | IA não acede a dados de outras turmas ou alunos. | Natália | Guilherme | P0 | TODO | L | - | RNF20 | ia-nao-acede-a-dados-de-outras-turmas-ou-alunos | Fase 1 | BK-MF2-15 |
| BK-MF2-15 | MF2 | IA explica fontes dos conteúdos (páginas/secções). | Natália | Guilherme | P0 | TODO | L | - | RNF31 | ia-explica-fontes-dos-conteudos-paginas-seccoes | Fase 1 | BK-MF2-16 |
| BK-MF2-16 | MF2 | IA respeita perfis distintos (aluno, turma, professor). | Natália | Guilherme | P0 | TODO | L | - | RNF32 | ia-respeita-perfis-distintos-aluno-turma-professor | Fase 1 | BK-MF2-17 |
| BK-MF2-17 | MF2 | IA evita enviesamentos e respostas inseguras. | Natália | Guilherme | P0 | TODO | L | - | RNF34 | ia-evita-enviesamentos-e-respostas-inseguras | Fase 1 | BK-MF2-18 |
| BK-MF2-18 | MF2 | IA não pode inventar informação factual. | Natália | Guilherme | P0 | TODO | L | - | RNF35 | ia-nao-pode-inventar-informacao-factual | Fase 1 | BK-MF2-19 |
| BK-MF2-19 | MF2 | IA externa segue políticas e filtros próprios. | Natália | Guilherme | P0 | TODO | L | - | RNF37 | ia-externa-segue-politicas-e-filtros-proprios | Fase 1 | BK-MF3-01 |
| BK-MF3-01 | MF3 | Criar turmas. | Guilherme | Natália | P0 | TODO | S | - | RF19 | criar-turmas | Fase 2 | BK-MF3-02 |
| BK-MF3-02 | MF3 | Criar disciplinas e associá-las às turmas. | Guilherme | Natália | P0 | TODO | M | BK-MF3-01 | RF20 | criar-disciplinas-e-associa-las-as-turmas | Fase 2 | BK-MF3-03 |
| BK-MF3-03 | MF3 | Submeter materiais da disciplina (versão oficial). | Guilherme | Natália | P0 | TODO | M | BK-MF3-02 | RF21 | submeter-materiais-da-disciplina-versao-oficial | Fase 2 | BK-MF3-04 |
| BK-MF3-04 | MF3 | Configurar “voz da IA” docente. | Kaua | Guilherme | P1 | TODO | M | BK-MF3-03 | RF22 | configurar-voz-da-ia-docente | Fase 2 | BK-MF3-05 |
| BK-MF3-05 | MF3 | O aluno inscrito numa turma recebe versão limitada da IA. | Guilherme | Natália | P0 | TODO | M | BK-MF3-04 | RF23 | o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia | Fase 2 | BK-MF3-06 |
| BK-MF3-06 | MF3 | Professores podem enviar avisos e publicações. | Kaua | Guilherme | P1 | TODO | M | BK-MF3-01 | RF24 | professores-podem-enviar-avisos-e-publicacoes | Fase 2 | BK-MF3-07 |
| BK-MF3-07 | MF3 | Professores podem criar salas de estudo guiado. | Daniel | Kaua | P2 | TODO | M | BK-MF3-01 | RF25 | professores-podem-criar-salas-de-estudo-guiado | Fase 2 | BK-MF3-08 |
| BK-MF3-08 | MF3 | IA segue limites definidos pelo professor. | Guilherme | Natália | P0 | TODO | S | - | RNF33 | ia-segue-limites-definidos-pelo-professor | Fase 2 | BK-MF4-01 |
| BK-MF4-01 | MF4 | Professores podem criar projetos para a turma. | Kaua | Guilherme | P1 | TODO | M | BK-MF3-01 | RF26 | professores-podem-criar-projetos-para-a-turma | Fase 2 | BK-MF4-02 |
| BK-MF4-02 | MF4 | A IA deve ajudar o aluno a elaborar projetos de forma gradual. | Kaua | Guilherme | P1 | TODO | M | BK-MF4-01 | RF27 | a-ia-deve-ajudar-o-aluno-a-elaborar-projetos-de-forma-gradual | Fase 2 | BK-MF4-03 |
| BK-MF4-03 | MF4 | Criar testes/mini-testes oficiais. | Guilherme | Natália | P0 | TODO | M | BK-MF3-02 | RF28 | criar-testes-mini-testes-oficiais | Fase 2 | BK-MF4-04 |
| BK-MF4-04 | MF4 | Rever e aprovar conteúdo gerado pela IA (resumos/quizzes). | Kaua | Guilherme | P1 | TODO | M | BK-MF3-03 | RF29 | rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes | Fase 2 | BK-MF4-05 |
| BK-MF4-05 | MF4 | Painel com progresso, dificuldades e métricas da turma. | Kaua | Guilherme | P1 | TODO | M | BK-MF3-06 | RF30 | painel-com-progresso-dificuldades-e-metricas-da-turma | Fase 2 | BK-MF4-06 |
| BK-MF4-06 | MF4 | Geração de quizzes em background quando necessário. | Kaua | Guilherme | P1 | TODO | S | - | RNF12 | geracao-de-quizzes-em-background-quando-necessario | Fase 2 | BK-MF5-01 |
| BK-MF5-01 | MF5 | Criar salas de estudo com outros alunos (livres ou por disciplina). | Kaua | Guilherme | P1 | TODO | M | BK-MF0-03 | RF14 | criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina | Fase 2 | BK-MF5-02 |
| BK-MF5-02 | MF5 | Partilhar materiais e apontamentos na sala. | Kaua | Guilherme | P1 | TODO | M | BK-MF5-01 | RF15 | partilhar-materiais-e-apontamentos-na-sala | Fase 2 | BK-MF5-03 |
| BK-MF5-03 | MF5 | IA partilhada da sala (mistura das áreas dos membros). | Daniel | Kaua | P2 | TODO | M | BK-MF5-01 | RF16 | ia-partilhada-da-sala-mistura-das-areas-dos-membros | Fase 2 | BK-MF5-04 |
| BK-MF5-04 | MF5 | Mini-testes em grupo com ranking local. | Daniel | Kaua | P2 | TODO | M | BK-MF5-01 | RF17 | mini-testes-em-grupo-com-ranking-local | Fase 2 | BK-MF5-05 |
| BK-MF5-05 | MF5 | Co-edição de apontamentos com histórico. | Daniel | Kaua | P2 | TODO | M | BK-MF5-01 | RF18 | co-edicao-de-apontamentos-com-historico | Fase 2 | BK-MF5-06 |
| BK-MF5-06 | MF5 | Criar grupos de estudo. | Kaua | Guilherme | P1 | TODO | M | BK-MF5-01 | RF41 | criar-grupos-de-estudo | Fase 2 | BK-MF5-07 |
| BK-MF5-07 | MF5 | Chat, partilha e notas coletivas. | Kaua | Guilherme | P1 | TODO | M | BK-MF5-06 | RF42 | chat-partilha-e-notas-coletivas | Fase 2 | BK-MF5-08 |
| BK-MF5-08 | MF5 | Agendar sessões de estudo coletivo. | Daniel | Kaua | P2 | TODO | M | BK-MF5-06 | RF43 | agendar-sessoes-de-estudo-coletivo | Fase 2 | BK-MF5-09 |
| BK-MF5-09 | MF5 | IA coletiva para sessões de grupo. | Daniel | Kaua | P2 | TODO | M | BK-MF5-06 | RF44 | ia-coletiva-para-sessoes-de-grupo | Fase 2 | BK-MF6-01 |
| BK-MF6-01 | MF6 | Pesquisa unificada por tópico/conceito/material. | Guilherme | Natália | P0 | TODO | M | BK-MF2-01 | RF45 | pesquisa-unificada-por-topico-conceito-material | Fase 3 | BK-MF6-02 |
| BK-MF6-02 | MF6 | Navegação por programa/currículo. | Kaua | Guilherme | P1 | TODO | M | BK-MF2-01 | RF46 | navegacao-por-programa-curriculo | Fase 3 | BK-MF6-03 |
| BK-MF6-03 | MF6 | Configurar preferências de notificações (email, push, app) por contexto. | Kaua | Guilherme | P1 | TODO | M | BK-MF0-02 | RF47 | configurar-preferencias-de-notificacoes-email-push-app-por-contexto | Fase 3 | BK-MF6-04 |
| BK-MF6-04 | MF6 | Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas. | Kaua | Guilherme | P1 | TODO | M | BK-MF0-05 | RF48 | alertar-alunos-sobre-rotinas-objetivos-e-sessoes-de-estudo-agendadas | Fase 3 | BK-MF6-05 |
| BK-MF6-05 | MF6 | Notificar grupos/turmas sobre novos materiais, feedback e tarefas. | Kaua | Guilherme | P1 | TODO | M | BK-MF3-06 | RF49 | notificar-grupos-turmas-sobre-novos-materiais-feedback-e-tarefas | Fase 3 | BK-MF6-06 |
| BK-MF6-06 | MF6 | Professores definem alertas de acompanhamento (ex.: aluno inativo X dias). | Kaua | Guilherme | P1 | TODO | M | BK-MF2-05 | RF50 | professores-definem-alertas-de-acompanhamento-ex-aluno-inativo-x-dias | Fase 3 | BK-MF6-07 |
| BK-MF6-07 | MF6 | Administradores configuram canais e quotas máximas de notificações. | Kaua | Guilherme | P1 | TODO | M | BK-MF6-06 | RF51 | administradores-configuram-canais-e-quotas-maximas-de-notificacoes | Fase 3 | BK-MF7-01 |
| BK-MF7-01 | MF7 | Exportar dados pessoais. | Natália | Guilherme | P0 | TODO | S | - | RF52 | exportar-dados-pessoais | Fase 3 | BK-MF7-02 |
| BK-MF7-02 | MF7 | Eliminar conta e dados. | Natália | Guilherme | P0 | TODO | S | - | RF53 | eliminar-conta-e-dados | Fase 3 | BK-MF7-03 |
| BK-MF7-03 | MF7 | Gestão de consentimentos para IA. | Natália | Guilherme | P0 | TODO | S | - | RF54 | gestao-de-consentimentos-para-ia | Fase 3 | BK-MF7-04 |
| BK-MF7-04 | MF7 | Gestão de utilizadores e papéis. | Natália | Guilherme | P0 | TODO | M | BK-MF0-04 | RF55 | gestao-de-utilizadores-e-papeis | Fase 3 | BK-MF7-05 |
| BK-MF7-05 | MF7 | Auditoria completa (materiais, IA, papéis). | Natália | Guilherme | P0 | TODO | L | BK-MF7-04 | RF56 | auditoria-completa-materiais-ia-papeis | Fase 3 | BK-MF7-06 |
| BK-MF7-06 | MF7 | Configurar modelos de IA e limites de uso. | Guilherme | Natália | P1 | TODO | M | BK-MF2-05 | RF57 | configurar-modelos-de-ia-e-limites-de-uso | Fase 3 | BK-MF7-07 |
| BK-MF7-07 | MF7 | Definir **quotas de IA** por aluno/turma/grupo e monitorizar consumo. | Guilherme | Natália | P1 | TODO | M | BK-MF7-06 | RF58 | definir-quotas-de-ia-por-aluno-turma-grupo-e-monitorizar-consumo | Fase 3 | BK-MF7-08 |
| BK-MF7-08 | MF7 | Painel de observabilidade (logs, métricas, alertas). | Guilherme | Natália | P1 | TODO | M | BK-MF7-04 | RF59 | painel-de-observabilidade-logs-metricas-alertas | Fase 3 | BK-MF7-09 |
| BK-MF7-09 | MF7 | HTTPS obrigatório (TLS 1.2+). | Natália | Guilherme | P0 | TODO | L | - | RNF14 | https-obrigatorio-tls-1-2 | Fase 3 | BK-MF7-10 |
| BK-MF7-10 | MF7 | Passwords com hashing seguro (bcrypt/argon2). | Natália | Guilherme | P0 | TODO | S | - | RNF15 | passwords-com-hashing-seguro-bcrypt-argon2 | Fase 3 | BK-MF7-11 |
| BK-MF7-11 | MF7 | Sessões com cookies HttpOnly + Secure + SameSite. | Natália | Guilherme | P0 | TODO | S | - | RNF16 | sessoes-com-cookies-httponly-secure-samesite | Fase 3 | BK-MF7-12 |
| BK-MF7-12 | MF7 | Proteções contra XSS, CSRF, Injection, brute force. | Natália | Guilherme | P0 | TODO | L | - | RNF17 | protecoes-contra-xss-csrf-injection-brute-force | Fase 3 | BK-MF7-13 |
| BK-MF7-13 | MF7 | Backups diários automáticos. | Guilherme | Natália | P1 | TODO | S | - | RNF21 | backups-diarios-automaticos | Fase 3 | BK-MF7-14 |
| BK-MF7-14 | MF7 | Auto-recovery após falhas. | Guilherme | Natália | P1 | TODO | S | - | RNF22 | auto-recovery-apos-falhas | Fase 3 | BK-MF7-15 |
| BK-MF7-15 | MF7 | Logs estruturados de eventos e erros. | Natália | Guilherme | P0 | TODO | L | - | RNF23 | logs-estruturados-de-eventos-e-erros | Fase 3 | BK-MF7-16 |
| BK-MF7-16 | MF7 | Downtime máximo aceitável < 1h/mês. | Kaua | Guilherme | P2 | TODO | S | - | RNF24 | downtime-maximo-aceitavel-1h-mes | Fase 3 | BK-MF7-17 |
| BK-MF7-17 | MF7 | Testes automatizados para módulos críticos. | Guilherme | Natália | P1 | TODO | S | - | RNF28 | testes-automatizados-para-modulos-criticos | Fase 3 | BK-MF7-18 |
| BK-MF7-18 | MF7 | Deploy com rollback. | Guilherme | Natália | P1 | TODO | S | - | RNF29 | deploy-com-rollback | Fase 3 | BK-MF7-19 |
| BK-MF7-19 | MF7 | Endpoint de health-check. | Guilherme | Natália | P1 | TODO | S | - | RNF30 | endpoint-de-health-check | Fase 3 | BK-MF8-01 |
| BK-MF8-01 | MF8 | Integração com calendários (ICS/Google). | Kaua | Guilherme | P1 | TODO | S | - | RF60 | integracao-com-calendarios-ics-google | Fase 3 | BK-MF8-02 |
| BK-MF8-02 | MF8 | Integração com Drives (Google/OneDrive) para co-edição com permissões. | Kaua | Guilherme | P1 | TODO | S | - | RF61 | integracao-com-drives-google-onedrive-para-co-edicao-com-permissoes | Fase 3 | BK-MF8-03 |
| BK-MF8-03 | MF8 | Single Sign-On escolar (OAuth/SAML). | Kaua | Guilherme | P1 | TODO | S | - | RF62 | single-sign-on-escolar-oauth-saml | Fase 3 | BK-MF8-04 |
| BK-MF8-04 | MF8 | Dashboards e estudo carregam em ≤ 2s. | Guilherme | Natália | P0 | TODO | S | - | RNF08 | dashboards-e-estudo-carregam-em-2s | Fase 3 | BK-MF8-05 |
| BK-MF8-05 | MF8 | Respostas da IA devem surgir em ≤ 4s. | Kaua | Guilherme | P1 | TODO | S | - | RNF09 | respostas-da-ia-devem-surgir-em-4s | Fase 3 | BK-MF8-06 |
| BK-MF8-06 | MF8 | Suportar ≥ 200 utilizadores simultâneos por escola. | Kaua | Guilherme | P1 | TODO | S | - | RNF10 | suportar-200-utilizadores-simultaneos-por-escola | Fase 3 | BK-MF8-07 |
| BK-MF8-07 | MF8 | Arquitetura preparada para escalar horizontalmente. | Daniel | Kaua | P2 | TODO | L | - | RNF13 | arquitetura-preparada-para-escalar-horizontalmente | Fase 3 | BK-MF8-08 |
| BK-MF8-08 | MF8 | Compatível com Chrome, Edge, Firefox, Safari. | Guilherme | Natália | P0 | TODO | S | - | RNF38 | compativel-com-chrome-edge-firefox-safari | Fase 3 | BK-MF8-09 |
| BK-MF8-09 | MF8 | Suporte a importação UTF-8 e PT-PT. | Guilherme | Natália | P0 | TODO | S | - | RNF39 | suporte-a-importacao-utf-8-e-pt-pt | Fase 3 | BK-MF8-10 |
| BK-MF8-10 | MF8 | Exportação de resumos/quizzes em PDF/MD. | Kaua | Guilherme | P1 | TODO | S | - | RNF40 | exportacao-de-resumos-quizzes-em-pdf-md | Fase 3 | BK-MF8-11 |
| BK-MF8-11 | MF8 | Preparado para integrações com Drive/ICS/LMS. | Daniel | Kaua | P2 | TODO | S | - | RNF41 | preparado-para-integracoes-com-drive-ics-lms | Fase 3 | - |

## Validação inicial
- BK duplicado: não detetado.
- BK órfão: não detetado (todos os BK estão mapeados a RF/RNF).
- Dependências inválidas: não detetadas.
- Referências cruzadas RF/RNF: detetadas dependências cruzadas de macro (`BK-MF2-01 -> BK-MF3-03` e `BK-MF2-06 -> BK-MF3-04`); tratadas com gate de desbloqueio em MF-VIEWS/PLANO-SPRINTS sem alterar precedência RF/RNF.

## Changelog
- **2026-04-12** - Matriz canónica inicial criada e validada (106 BK).
