# Study Flow - Plataforma Inteligente de Acompanhamento ao Estudo

O Study Flow é uma plataforma inteligente de acompanhamento ao estudo que combina organização académica, colaboração e assistentes de IA personalizados. Permite que cada aluno estude ao seu próprio ritmo, com materiais próprios ou fornecidos pelo professor, enquanto recebe resumos, explicações, quizzes, acompanhamento e planos de estudo adaptados ao seu nível, dificuldades e objetivos. A plataforma permite ao aluno definir os parâmetros da IA, gerir rotinas semanais e monitorizar o seu progresso ao longo do tempo.

Além do estudo individual, o Study Flow permite criar salas de estudo em grupo, onde os alunos partilham materiais, co-editam apontamentos, realizam mini-testes com ranking e utilizam uma IA conjunta baseada nos conteúdos dos membros. Em paralelo, professores podem criar turmas e disciplinas, publicar materiais oficiais, configurar a “voz” da IA docente, acompanhar progresso, propor projetos e testes, e apoiar os alunos com ferramentas pedagógicas avançadas.

A plataforma integra também ingestão segura de documentos, indexação automática, perfis de IA distintos (aluno, grupo, turma, professor) e guardrails de privacidade, assegurando que cada contexto utiliza apenas os materiais autorizados. Desenvolvido no âmbito da PAP de Informática de Gestão (2025/2026), o Study Flow foca-se numa experiência de estudo moderna, ética e alinhada com o funcionamento real das escolas.

---

**Índice**

1. [Contexto do Projeto](#contexto-do-projeto)
2. [Visão e Objetivos](#visão-e-objetivos)
3. [Público-Alvo e Stakeholders](#público-alvo-e-stakeholders)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Requisitos Não Funcionais Essenciais](#requisitos-não-funcionais-essenciais)
6. [Stack e Arquitetura Recomendada](#stack-e-arquitetura-recomendada)
7. [Roadmap para o MVP (inclui todos os RF)](#roadmap-para-o-mvp-inclui-todos-os-rf)
8. [Identificação e Créditos](#identificação-e-créditos)
9. [Licença](#licença)
10. [Changelog](#changelog)

---

## Contexto do Projeto

-   Extensão digital da sala de aula que permite estudar sozinho, em grupo ou em contexto de turma com suporte de IA.
-   Concilia áreas privadas (aluno), turmas oficiais (professor) e salas colaborativas com guardrails de privacidade.
-   Oferece resumo, quizzes, explicações, cartões, gestão de projetos, notificações e métricas de aprendizagem.

---

## Visão e Objetivos

1. Facilitar estudo personalizado com IA adaptada ao estilo de cada aluno ou professor.
2. Fornecer ferramentas de colaboração e co-estudo com segurança e controlo de contexto.
3. Apoiar professores na criação de materiais, projetos, testes e acompanhamento de dificuldades.
4. Operar com compliance RGPD e transparência sobre a utilização de dados pela IA.

---

## Público-Alvo e Stakeholders

-   **Alunos independentes** – criam áreas de estudo privadas, rotinas e objetivos.
-   **Alunos em turmas** – acedem aos materiais oficiais e comunicação docente.
-   **Professores** – gerem turmas, disciplinas, projetos, feedback e IA docente.
-   **Equipa pedagógica/escola** – acompanha métricas globais e conformidade.
-   **Administradores técnicos** – asseguram segurança, quotas de IA e monitorização.

---

## Funcionalidades Principais

### Estudo Individual e Áreas Privadas

-   Registo, login seguro, perfis editáveis e possibilidade de estudar sem turma (RF01–RF06).
-   Criação de áreas de estudo com upload de materiais (PDF, DOCX, URLs), definição da “voz” de IA e geração de resumos, explicações, quizzes e cartões (RF07–RF13).
-   Rotinas e objetivos semanais, histórico de estudo e acompanhamento por dificuldade.

### Estudo em Grupo e Comunidade

-   Salas de estudo partilhadas, materiais colaborativos, IA da sala baseada nos conteúdos dos membros, mini-testes com ranking e co-edição com histórico (RF14–RF18, RF41–RF44).
-   Guardrails para garantir que apenas membros têm acesso aos materiais do grupo.

### Professores, Turmas e Disciplinas

-   Criação de turmas/disciplinas, submissão de materiais oficiais e personalização do tom da IA docente (RF19–RF25).
-   Publicação de avisos, salas de estudo guiado, acompanhamento de projetos e testes com critérios e rubricas (RF26–RF34).
-   Painéis de progresso por turma, identificação de dificuldades e recomendações de apoio (RF35–RF39).

### Sistema e IA

-   Ingestão segura de materiais, indexação assíncrona, perfis IA diferenciados (aluno, turma, professor) e guardrails por contexto (RF31–RF38).
-   Critérios de aceitação definidos para resumos, quizzes, estudo em grupo, projetos e integração curricular (secção 13 dos RF).

### Administração e Operação

-   Gestão de utilizadores/papéis, auditoria, configuração de modelos IA, limites de utilização, notificações e integrações (RF47–RF55).
-   Privacidade/RGPD: exportação/eliminação de dados, consentimentos e separação de contextos.

> Detalhes completos em [`docs/RF.md`](docs/RF.md#índice).

---

## Requisitos Não Funcionais Essenciais

-   **Usabilidade/Acessibilidade** – UI consistente para alunos e professores, responsiva, com validação preventiva e notificações discretas (RNF01–RNF07).
-   **Performance** – Dashboards ≤2s, respostas IA ≤4s, indexação assíncrona que não bloqueia UI e geração de quizzes em background (RNF08–RNF13).
-   **Segurança/Privacidade** – HTTPS, hashing seguro, cookies protegidos, sandbox de documentos, guardrails IA e isolamento entre turmas/alunos (RNF14–RNF20).
-   **Fiabilidade/Operação** – Backups diários, auto-recovery, logs estruturados e downtime <1h/mês (RNF21–RNF24).
-   **Manutenção/Qualidade** – Backend e frontend modulares, documentação técnica, testes automatizados, deploy com rollback e health-check (RNF25–RNF30).
-   **IA Ética** – Citações de origem, respeito por perfis distintos, limites definidos pelo professor e prevenção de hallucinações (RNF31–RNF37).
-   **Compatibilidade/Localização** – Browsers modernos, importação UTF-8, exportação PDF/Markdown, interface em PT-PT e preparação para i18n (RNF38–RNF44).

> Detalhes completos em [`docs/RNF.md`](docs/RNF.md#índice).

---

## Stack e Arquitetura Recomendada

```
frontend/   # Next.js/React + TypeScript, Tailwind, Zustand/TanStack Query
backend/    # NestJS (Node.js) com Prisma, módulos por domínio (aluno, professor, IA, materiais)
ia/         # Serviços dedicados à personalização, indexação e guardrails
docs/       # RF, RNF, fluxos, arquitetura e decisões técnicas
scripts/    # Ferramentas para ingestão, seeds e manutenção
```

-   **Base de dados:** PostgreSQL + Redis para cache/sessões.
-   **IA:** OpenAI API combinada com microserviço Python/Node para indexação e personalização.
-   **Integrações:** Calendários (ICS/Google), Drive, SSO escolar (OAuth/SAML) no roadmap.
-   **DevOps:** Railway/Render/Fly.io, GitHub Actions, monitorização e backups automáticos.

---

## Roadmap para o MVP (inclui todos os RF)

1. **Fase 1 - Áreas Privadas:** autenticação, perfis, upload/indexação básica, assistente IA com citações e rotinas individuais.
2. **Fase 2 - Turmas e Professores:** gestão de turmas/disciplines, materiais oficiais, IA docente, projetos, testes e painéis de progresso.
3. **Fase 3 - Colaboração e Comunidade:** salas de estudo em grupo, mini-testes, co-edição, notificações e integrações iniciais.
4. **Fase 4 - Operação e Escala:** administração avançada, guardrails refinados, integrações externas e otimizações de performance/observabilidade.

---

## Identificação e Créditos

> **Projeto:** Study Flow - Plataforma Inteligente de Acompanhamento ao Estudo  
> **Tipo:** PAP - Curso Profissional de Informática de Gestão  
> **Áreas:** Programação · Gestão · Base de Dados  
> **Ano letivo:** 2025/2026  
> **Versão:** 1.0  
> **Equipa:** [Natália, Daniel, Kaua, Guilherme]  
> **Professor Orientador:** Nuno Castro e Cláudia Marques

---

## Licença

Projeto académico destinado exclusivamente a fins educativos.

---

## Changelog

-   **2024-04-27** – README reorganizado com estrutura uniforme, funcionalidades detalhadas e roadmap.
