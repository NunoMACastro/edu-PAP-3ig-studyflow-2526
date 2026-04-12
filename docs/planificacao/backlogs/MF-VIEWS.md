# MF-VIEWS

## Header
- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Sequência macro
MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8

## Gate de dependências cruzadas
- `BK-MF2-01` só avança para execução completa após desbloqueio de `BK-MF3-03`.
- `BK-MF2-06` só avança para execução completa após desbloqueio de `BK-MF3-04`.
- Estes gates preservam a ordem macro documental sem violar dependências RF.

## MF0 - Fundamentos e governance
### Sequência por macro
BK-MF0-01, BK-MF0-02, BK-MF0-03, BK-MF0-04, BK-MF0-05, BK-MF0-06, BK-MF0-07, BK-MF0-08, BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF0-12, BK-MF0-13, BK-MF0-14, BK-MF0-15, BK-MF0-16, BK-MF0-17, BK-MF0-18, BK-MF0-19

### Guias disponíveis
- [BK-MF0-01 - Registo do aluno (email/password ou SSO escolar).](../guias-bk/MF0/BK-MF0-01.md)
- [BK-MF0-02 - Login seguro com cookies HttpOnly.](../guias-bk/MF0/BK-MF0-02.md)
- [BK-MF0-03 - Perfil editável (nome, ano, curso, turma).](../guias-bk/MF0/BK-MF0-03.md)
- [BK-MF0-04 - O aluno pode estudar sem turma.](../guias-bk/MF0/BK-MF0-04.md)
- [BK-MF0-05 - O aluno pode criar rotinas e objetivos de estudo.](../guias-bk/MF0/BK-MF0-05.md)
- [BK-MF0-06 - O aluno pode consultar histórico de estudo.](../guias-bk/MF0/BK-MF0-06.md)
- [BK-MF0-07 - Interface intuitiva e clara para alunos e professores.](../guias-bk/MF0/BK-MF0-07.md)
- [BK-MF0-08 - Layout responsivo para desktop/tablet/mobile.](../guias-bk/MF0/BK-MF0-08.md)
- [BK-MF0-09 - Feedback imediato em ações (guardar, IA, uploads).](../guias-bk/MF0/BK-MF0-09.md)
- [BK-MF0-10 - Navegação consistente entre módulos.](../guias-bk/MF0/BK-MF0-10.md)
- [BK-MF0-11 - Regras básicas de acessibilidade (contraste, labels).](../guias-bk/MF0/BK-MF0-11.md)
- [BK-MF0-12 - Validação completa de formulários antes de submissão.](../guias-bk/MF0/BK-MF0-12.md)
- [BK-MF0-13 - Notificações discretas e contextualizadas.](../guias-bk/MF0/BK-MF0-13.md)
- [BK-MF0-14 - Backend modular por domínios (aluno, professor, IA, materiais).](../guias-bk/MF0/BK-MF0-14.md)
- [BK-MF0-15 - Frontend componentizado e reutilizável.](../guias-bk/MF0/BK-MF0-15.md)
- [BK-MF0-16 - Documentação técnica mínima (modelos, fluxos, endpoints).](../guias-bk/MF0/BK-MF0-16.md)
- [BK-MF0-17 - Interface em português (Portugal).](../guias-bk/MF0/BK-MF0-17.md)
- [BK-MF0-18 - Datas no formato dd/mm/aaaa.](../guias-bk/MF0/BK-MF0-18.md)
- [BK-MF0-19 - Preparado para futura tradução i18n.](../guias-bk/MF0/BK-MF0-19.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF1 - Estudo individual e IA privada
### Sequência por macro
BK-MF1-01, BK-MF1-02, BK-MF1-03, BK-MF1-04, BK-MF1-05, BK-MF1-06, BK-MF1-07, BK-MF1-08

### Guias disponíveis
- [BK-MF1-01 - Criar “Áreas de Estudo” (auto-disciplina independente).](../guias-bk/MF1/BK-MF1-01.md)
- [BK-MF1-02 - Submeter materiais (PDF, DOCX, URLs, tópicos).](../guias-bk/MF1/BK-MF1-02.md)
- [BK-MF1-03 - Associar estilo/tom das aulas → “voz” da IA.](../guias-bk/MF1/BK-MF1-03.md)
- [BK-MF1-04 - Criar perfil IA da Área de Estudo.](../guias-bk/MF1/BK-MF1-04.md)
- [BK-MF1-05 - Obter resumos IA baseados nos materiais enviados.](../guias-bk/MF1/BK-MF1-05.md)
- [BK-MF1-06 - Obter explicações, cards e quizzes personalizados.](../guias-bk/MF1/BK-MF1-06.md)
- [BK-MF1-07 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.](../guias-bk/MF1/BK-MF1-07.md)
- [BK-MF1-08 - IA adapta explicações ao nível do aluno.](../guias-bk/MF1/BK-MF1-08.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF2 - Conhecimento + IA core
### Sequência por macro
BK-MF2-01, BK-MF2-02, BK-MF2-03, BK-MF2-04, BK-MF2-05, BK-MF2-06, BK-MF2-07, BK-MF2-08, BK-MF2-09, BK-MF2-10, BK-MF2-11, BK-MF2-12, BK-MF2-13, BK-MF2-14, BK-MF2-15, BK-MF2-16, BK-MF2-17, BK-MF2-18, BK-MF2-19

### Guias disponíveis
- [BK-MF2-01 - Indexação automática de PDFs, DOCX e URLs.](../guias-bk/MF2/BK-MF2-01.md)
- [BK-MF2-02 - Extrair tópicos, secções, estrutura e referências.](../guias-bk/MF2/BK-MF2-02.md)
- [BK-MF2-03 - Manter versões dos materiais.](../guias-bk/MF2/BK-MF2-03.md)
- [BK-MF2-04 - Separar materiais entre “aluno”, “professor” e “turma”.](../guias-bk/MF2/BK-MF2-04.md)
- [BK-MF2-05 - Assistente IA privado por Área de Estudo.](../guias-bk/MF2/BK-MF2-05.md)
- [BK-MF2-06 - Assistente IA da disciplina/turma com voz docente.](../guias-bk/MF2/BK-MF2-06.md)
- [BK-MF2-07 - Guardrails distintos para aluno solo, grupo e turma.](../guias-bk/MF2/BK-MF2-07.md)
- [BK-MF2-08 - IA não pode inventar conteúdo (citações obrigatórias).](../guias-bk/MF2/BK-MF2-08.md)
- [BK-MF2-09 - IA pode recorrer a conhecimento externo (limitado) quando permitido.](../guias-bk/MF2/BK-MF2-09.md)
- [BK-MF2-10 - IA deve ajustar explicações ao perfil do aluno.](../guias-bk/MF2/BK-MF2-10.md)
- [BK-MF2-11 - Indexação de documentos deve ser assíncrona e não bloquear UI.](../guias-bk/MF2/BK-MF2-11.md)
- [BK-MF2-12 - Processamento de documentos em sandbox seguro.](../guias-bk/MF2/BK-MF2-12.md)
- [BK-MF2-13 - Guardrails obrigatórios na IA.](../guias-bk/MF2/BK-MF2-13.md)
- [BK-MF2-14 - IA não acede a dados de outras turmas ou alunos.](../guias-bk/MF2/BK-MF2-14.md)
- [BK-MF2-15 - IA explica fontes dos conteúdos (páginas/secções).](../guias-bk/MF2/BK-MF2-15.md)
- [BK-MF2-16 - IA respeita perfis distintos (aluno, turma, professor).](../guias-bk/MF2/BK-MF2-16.md)
- [BK-MF2-17 - IA evita enviesamentos e respostas inseguras.](../guias-bk/MF2/BK-MF2-17.md)
- [BK-MF2-18 - IA não pode inventar informação factual.](../guias-bk/MF2/BK-MF2-18.md)
- [BK-MF2-19 - IA externa segue políticas e filtros próprios.](../guias-bk/MF2/BK-MF2-19.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF3 - Professor/turmas
### Sequência por macro
BK-MF3-01, BK-MF3-02, BK-MF3-03, BK-MF3-04, BK-MF3-05, BK-MF3-06, BK-MF3-07, BK-MF3-08

### Guias disponíveis
- [BK-MF3-01 - Criar turmas.](../guias-bk/MF3/BK-MF3-01.md)
- [BK-MF3-02 - Criar disciplinas e associá-las às turmas.](../guias-bk/MF3/BK-MF3-02.md)
- [BK-MF3-03 - Submeter materiais da disciplina (versão oficial).](../guias-bk/MF3/BK-MF3-03.md)
- [BK-MF3-04 - Configurar “voz da IA” docente.](../guias-bk/MF3/BK-MF3-04.md)
- [BK-MF3-05 - O aluno inscrito numa turma recebe versão limitada da IA.](../guias-bk/MF3/BK-MF3-05.md)
- [BK-MF3-06 - Professores podem enviar avisos e publicações.](../guias-bk/MF3/BK-MF3-06.md)
- [BK-MF3-07 - Professores podem criar salas de estudo guiado.](../guias-bk/MF3/BK-MF3-07.md)
- [BK-MF3-08 - IA segue limites definidos pelo professor.](../guias-bk/MF3/BK-MF3-08.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF4 - Projetos/testes/curadoria
### Sequência por macro
BK-MF4-01, BK-MF4-02, BK-MF4-03, BK-MF4-04, BK-MF4-05, BK-MF4-06

### Guias disponíveis
- [BK-MF4-01 - Professores podem criar projetos para a turma.](../guias-bk/MF4/BK-MF4-01.md)
- [BK-MF4-02 - A IA deve ajudar o aluno a elaborar projetos de forma gradual.](../guias-bk/MF4/BK-MF4-02.md)
- [BK-MF4-03 - Criar testes/mini-testes oficiais.](../guias-bk/MF4/BK-MF4-03.md)
- [BK-MF4-04 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).](../guias-bk/MF4/BK-MF4-04.md)
- [BK-MF4-05 - Painel com progresso, dificuldades e métricas da turma.](../guias-bk/MF4/BK-MF4-05.md)
- [BK-MF4-06 - Geração de quizzes em background quando necessário.](../guias-bk/MF4/BK-MF4-06.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF5 - Colaboração e co-estudo
### Sequência por macro
BK-MF5-01, BK-MF5-02, BK-MF5-03, BK-MF5-04, BK-MF5-05, BK-MF5-06, BK-MF5-07, BK-MF5-08, BK-MF5-09

### Guias disponíveis
- [BK-MF5-01 - Criar salas de estudo com outros alunos (livres ou por disciplina).](../guias-bk/MF5/BK-MF5-01.md)
- [BK-MF5-02 - Partilhar materiais e apontamentos na sala.](../guias-bk/MF5/BK-MF5-02.md)
- [BK-MF5-03 - IA partilhada da sala (mistura das áreas dos membros).](../guias-bk/MF5/BK-MF5-03.md)
- [BK-MF5-04 - Mini-testes em grupo com ranking local.](../guias-bk/MF5/BK-MF5-04.md)
- [BK-MF5-05 - Co-edição de apontamentos com histórico.](../guias-bk/MF5/BK-MF5-05.md)
- [BK-MF5-06 - Criar grupos de estudo.](../guias-bk/MF5/BK-MF5-06.md)
- [BK-MF5-07 - Chat, partilha e notas coletivas.](../guias-bk/MF5/BK-MF5-07.md)
- [BK-MF5-08 - Agendar sessões de estudo coletivo.](../guias-bk/MF5/BK-MF5-08.md)
- [BK-MF5-09 - IA coletiva para sessões de grupo.](../guias-bk/MF5/BK-MF5-09.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF6 - Pesquisa e notificações
### Sequência por macro
BK-MF6-01, BK-MF6-02, BK-MF6-03, BK-MF6-04, BK-MF6-05, BK-MF6-06, BK-MF6-07

### Guias disponíveis
- [BK-MF6-01 - Pesquisa unificada por tópico/conceito/material.](../guias-bk/MF6/BK-MF6-01.md)
- [BK-MF6-02 - Navegação por programa/currículo.](../guias-bk/MF6/BK-MF6-02.md)
- [BK-MF6-03 - Configurar preferências de notificações (email, push, app) por contexto.](../guias-bk/MF6/BK-MF6-03.md)
- [BK-MF6-04 - Alertar alunos sobre rotinas, objetivos e sessões de estudo agendadas.](../guias-bk/MF6/BK-MF6-04.md)
- [BK-MF6-05 - Notificar grupos/turmas sobre novos materiais, feedback e tarefas.](../guias-bk/MF6/BK-MF6-05.md)
- [BK-MF6-06 - Professores definem alertas de acompanhamento (ex.: aluno inativo X dias).](../guias-bk/MF6/BK-MF6-06.md)
- [BK-MF6-07 - Administradores configuram canais e quotas máximas de notificações.](../guias-bk/MF6/BK-MF6-07.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF7 - Privacidade/admin/operação
### Sequência por macro
BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10, BK-MF7-11, BK-MF7-12, BK-MF7-13, BK-MF7-14, BK-MF7-15, BK-MF7-16, BK-MF7-17, BK-MF7-18, BK-MF7-19

### Guias disponíveis
- [BK-MF7-01 - Exportar dados pessoais.](../guias-bk/MF7/BK-MF7-01.md)
- [BK-MF7-02 - Eliminar conta e dados.](../guias-bk/MF7/BK-MF7-02.md)
- [BK-MF7-03 - Gestão de consentimentos para IA.](../guias-bk/MF7/BK-MF7-03.md)
- [BK-MF7-04 - Gestão de utilizadores e papéis.](../guias-bk/MF7/BK-MF7-04.md)
- [BK-MF7-05 - Auditoria completa (materiais, IA, papéis).](../guias-bk/MF7/BK-MF7-05.md)
- [BK-MF7-06 - Configurar modelos de IA e limites de uso.](../guias-bk/MF7/BK-MF7-06.md)
- [BK-MF7-07 - Definir **quotas de IA** por aluno/turma/grupo e monitorizar consumo.](../guias-bk/MF7/BK-MF7-07.md)
- [BK-MF7-08 - Painel de observabilidade (logs, métricas, alertas).](../guias-bk/MF7/BK-MF7-08.md)
- [BK-MF7-09 - HTTPS obrigatório (TLS 1.2+).](../guias-bk/MF7/BK-MF7-09.md)
- [BK-MF7-10 - Passwords com hashing seguro (bcrypt/argon2).](../guias-bk/MF7/BK-MF7-10.md)
- [BK-MF7-11 - Sessões com cookies HttpOnly + Secure + SameSite.](../guias-bk/MF7/BK-MF7-11.md)
- [BK-MF7-12 - Proteções contra XSS, CSRF, Injection, brute force.](../guias-bk/MF7/BK-MF7-12.md)
- [BK-MF7-13 - Backups diários automáticos.](../guias-bk/MF7/BK-MF7-13.md)
- [BK-MF7-14 - Auto-recovery após falhas.](../guias-bk/MF7/BK-MF7-14.md)
- [BK-MF7-15 - Logs estruturados de eventos e erros.](../guias-bk/MF7/BK-MF7-15.md)
- [BK-MF7-16 - Downtime máximo aceitável < 1h/mês.](../guias-bk/MF7/BK-MF7-16.md)
- [BK-MF7-17 - Testes automatizados para módulos críticos.](../guias-bk/MF7/BK-MF7-17.md)
- [BK-MF7-18 - Deploy com rollback.](../guias-bk/MF7/BK-MF7-18.md)
- [BK-MF7-19 - Endpoint de health-check.](../guias-bk/MF7/BK-MF7-19.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## MF8 - Integrações/compatibilidade/escala
### Sequência por macro
BK-MF8-01, BK-MF8-02, BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07, BK-MF8-08, BK-MF8-09, BK-MF8-10, BK-MF8-11

### Guias disponíveis
- [BK-MF8-01 - Integração com calendários (ICS/Google).](../guias-bk/MF8/BK-MF8-01.md)
- [BK-MF8-02 - Integração com Drives (Google/OneDrive) para co-edição com permissões.](../guias-bk/MF8/BK-MF8-02.md)
- [BK-MF8-03 - Single Sign-On escolar (OAuth/SAML).](../guias-bk/MF8/BK-MF8-03.md)
- [BK-MF8-04 - Dashboards e estudo carregam em ≤ 2s.](../guias-bk/MF8/BK-MF8-04.md)
- [BK-MF8-05 - Respostas da IA devem surgir em ≤ 4s.](../guias-bk/MF8/BK-MF8-05.md)
- [BK-MF8-06 - Suportar ≥ 200 utilizadores simultâneos por escola.](../guias-bk/MF8/BK-MF8-06.md)
- [BK-MF8-07 - Arquitetura preparada para escalar horizontalmente.](../guias-bk/MF8/BK-MF8-07.md)
- [BK-MF8-08 - Compatível com Chrome, Edge, Firefox, Safari.](../guias-bk/MF8/BK-MF8-08.md)
- [BK-MF8-09 - Suporte a importação UTF-8 e PT-PT.](../guias-bk/MF8/BK-MF8-09.md)
- [BK-MF8-10 - Exportação de resumos/quizzes em PDF/MD.](../guias-bk/MF8/BK-MF8-10.md)
- [BK-MF8-11 - Preparado para integrações com Drive/ICS/LMS.](../guias-bk/MF8/BK-MF8-11.md)

### Step-by-step macro
1. Confirmar dependências desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequência técnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualização documental.
5. Fechar macro apenas com critérios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro estão documentados e com guia válido.
- Dependências entre BK do macro e macro seguinte estão resolvidas.
- KPIs semanais do plano de sprints não apresentam desvios críticos.

## Changelog
- **2026-04-12** - Views por macro criadas com links reais para todos os guias BK.
