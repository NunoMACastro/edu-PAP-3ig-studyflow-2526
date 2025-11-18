# Study Flow — Requisitos Funcionais (RF)

> **PAP — Curso Profissional de Informática de Gestão**  
> **Áreas:** Programação · Gestão · Base de Dados  
> **Ano letivo:** 2025/2026  
> **Versão:** 1.0  
> **Elaborado por:** [Nome do Grupo]  
> **Professor Orientador:** Nuno Miguel Almeida Castro

# Estrutura Centranda no Utilizador

## Índice

1. Aluno — Estudo Individual
2. Aluno — Áreas de Estudo e IA Privada
3. Aluno — Estudo em Grupo e Salas Partilhadas
4. Professor — Turmas, Disciplinas e IA Docente
5. Professor — Projetos, Testes e Curadoria
6. Sistema — Ingestão de Materiais e Base de Conhecimento
7. Sistema — IA (Assistentes, Guardrails, Perfis)
8. Comunidade — Grupos, Salas e Co-Estudo
9. Pesquisa e Navegação
10. Privacidade e RGPD
11. Administração e Operação
12. Integrações
13. Critérios de Aceitação (Agrupados por Funcionalidade)

---

## 1. Aluno — Estudo Individual

| Código | Requisito                                         | Atores | Prioridade | Dependências |
| ------ | ------------------------------------------------- | ------ | ---------- | ------------ |
| RF01   | Registo do aluno (email/password ou SSO escolar). | Aluno  | Must       | —            |
| RF02   | Login seguro com cookies HttpOnly.                | Aluno  | Must       | —            |
| RF03   | Perfil editável (nome, ano, curso, turma).        | Aluno  | Should     | RF02         |
| RF04   | O aluno pode estudar sem turma.                   | Aluno  | Must       | RF03         |
| RF05   | O aluno pode criar rotinas e objetivos de estudo. | Aluno  | Should     | RF03         |
| RF06   | O aluno pode consultar histórico de estudo.       | Aluno  | Should     | RF03         |

---

## 2. Aluno — Áreas de Estudo e IA Privada

| Código | Requisito                                                     | Atores         | Prioridade | Dependências |
| ------ | ------------------------------------------------------------- | -------------- | ---------- | ------------ |
| RF07   | Criar “Áreas de Estudo” (auto-disciplina independente).       | Aluno          | Must       | RF03         |
| RF08   | Submeter materiais (PDF, DOCX, URLs, tópicos).                | Aluno          | Must       | RF07         |
| RF09   | Associar estilo/tom das aulas → “voz” da IA.                  | Aluno          | Should     | RF07         |
| RF10   | Criar perfil IA da Área de Estudo.                            | Sistema, Aluno | Must       | RF08         |
| RF11   | Obter resumos IA baseados nos materiais enviados.             | Aluno          | Must       | RF08, RF10   |
| RF12   | Obter explicações, cards e quizzes personalizados.            | Aluno          | Must       | RF11         |
| RF13   | A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | Sistema        | Should     | RF11         |

---

## 3. Aluno — Estudo em Grupo e Salas Partilhadas

| Código | Requisito                                                           | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------------------- | ------- | ---------- | ------------ |
| RF14   | Criar salas de estudo com outros alunos (livres ou por disciplina). | Aluno   | Should     | RF03         |
| RF15   | Partilhar materiais e apontamentos na sala.                         | Aluno   | Should     | RF14         |
| RF16   | IA partilhada da sala (mistura das áreas dos membros).              | Sistema | Could      | RF14         |
| RF17   | Mini-testes em grupo com ranking local.                             | Aluno   | Could      | RF14         |
| RF18   | Co-edição de apontamentos com histórico.                            | Aluno   | Could      | RF14         |

---

## 4. Professor — Turmas, Disciplinas e IA Docente

| Código | Requisito                                                 | Atores    | Prioridade | Dependências |
| ------ | --------------------------------------------------------- | --------- | ---------- | ------------ |
| RF19   | Criar turmas.                                             | Professor | Must       | —            |
| RF20   | Criar disciplinas e associá-las às turmas.                | Professor | Must       | RF19         |
| RF21   | Submeter materiais da disciplina (versão oficial).        | Professor | Must       | RF20         |
| RF22   | Configurar “voz da IA” docente.                           | Professor | Should     | RF21         |
| RF23   | O aluno inscrito numa turma recebe versão limitada da IA. | Sistema   | Must       | RF22         |
| RF24   | Professores podem enviar avisos e publicações.            | Professor | Should     | RF19         |
| RF25   | Professores podem criar salas de estudo guiado.           | Professor | Could      | RF19         |

---

## 5. Professor — Projetos, Testes e Curadoria

| Código | Requisito                                                      | Atores    | Prioridade | Dep. |
| ------ | -------------------------------------------------------------- | --------- | ---------- | ---- |
| RF26   | Professores podem criar projetos para a turma.                 | Professor | Should     | RF19 |
| RF27   | A IA deve ajudar o aluno a elaborar projetos de forma gradual. | IA, Aluno | Should     | RF26 |
| RF28   | Criar testes/mini-testes oficiais.                             | Professor | Must       | RF20 |
| RF29   | Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).     | Professor | Should     | RF21 |
| RF30   | Painel com progresso, dificuldades e métricas da turma.        | Professor | Should     | RF24 |

---

## 6. Sistema — Ingestão de Materiais e Base de Conhecimento

| Código | Requisito                                               | Atores  | Prioridade | Dependências |
| ------ | ------------------------------------------------------- | ------- | ---------- | ------------ |
| RF31   | Indexação automática de PDFs, DOCX e URLs.              | Sistema | Must       | RF08/RF21    |
| RF32   | Extrair tópicos, secções, estrutura e referências.      | Sistema | Must       | RF31         |
| RF33   | Manter versões dos materiais.                           | Sistema | Should     | RF31         |
| RF34   | Separar materiais entre “aluno”, “professor” e “turma”. | Sistema | Must       | RF31         |

---

## 7. Sistema — IA (Assistentes, Guardrails, Perfis)

| Código | Requisito                                                            | Atores  | Prioridade | Dep. |
| ------ | -------------------------------------------------------------------- | ------- | ---------- | ---- |
| RF35   | Assistente IA privado por Área de Estudo.                            | Sistema | Must       | RF10 |
| RF36   | Assistente IA da disciplina/turma com voz docente.                   | Sistema | Must       | RF22 |
| RF37   | Guardrails distintos para aluno solo, grupo e turma.                 | Sistema | Must       | RF35 |
| RF38   | IA não pode inventar conteúdo (citações obrigatórias).               | Sistema | Must       | RF31 |
| RF39   | IA pode recorrer a conhecimento externo (limitado) quando permitido. | Sistema | Should     | RF35 |
| RF40   | IA deve ajustar explicações ao perfil do aluno.                      | Sistema | Should     | RF13 |

---

## 8. Comunidade — Grupos, Salas e Co-Estudo

| Código | Requisito                           | Atores           | Prioridade | Dep. |
| ------ | ----------------------------------- | ---------------- | ---------- | ---- |
| RF41   | Criar grupos de estudo.             | Aluno            | Should     | RF14 |
| RF42   | Chat, partilha e notas coletivas.   | Aluno            | Should     | RF41 |
| RF43   | Agendar sessões de estudo coletivo. | Aluno, Professor | Could      | RF41 |
| RF44   | IA coletiva para sessões de grupo.  | Sistema          | Could      | RF41 |

---

## 9. Pesquisa e Navegação

| Código | Requisito                                        | Atores | Prioridade | Dep. |
| ------ | ------------------------------------------------ | ------ | ---------- | ---- |
| RF45   | Pesquisa unificada por tópico/conceito/material. | Todos  | Must       | RF31 |
| RF46   | Navegação por programa/currículo.                | Todos  | Should     | RF31 |

---

## 10. Privacidade e RGPD

| Código | Requisito                         | Atores | Prioridade | Dep. |
| ------ | --------------------------------- | ------ | ---------- | ---- |
| RF47   | Exportar dados pessoais.          | Todos  | Must       | —    |
| RF48   | Eliminar conta e dados.           | Todos  | Must       | —    |
| RF49   | Gestão de consentimentos para IA. | Todos  | Must       | —    |

---

## 11. Administração e Operação

| Código | Requisito                                   | Atores | Prioridade | Dep  |
| ------ | ------------------------------------------- | ------ | ---------- | ---- |
| RF50   | Gestão de utilizadores e papéis.            | Admin  | Must       | RF04 |
| RF51   | Auditoria completa (materiais, IA, papéis). | Admin  | Must       | RF50 |
| RF52   | Configurar modelos de IA e limites.         | Admin  | Could      | RF35 |

---

## 12. Integrações

| Código | Requisito                                | Atores           | Prioridade |
| ------ | ---------------------------------------- | ---------------- | ---------- |
| RF53   | Integração com calendários (ICS/Google). | Aluno, Professor | Could      |
| RF54   | Integração com Drives (Google/OneDrive). | Professor        | Could      |
| RF55   | Single Sign-On escolar (OAuth/SAML).     | Todos            | Could      |

---

# 13. Critérios de Aceitação (Agrupados por Funcionalidade)

## A) Resumos com IA (RF16, RF18, RF19, RF38)

-   Resumo deve indicar página/secção de origem.
-   Não pode incluir conteúdo não existente nos ficheiros fornecidos.
-   Quando a voz do professor está ativa, o resumo deve refletir o tom docente.

## B) Quizzes e Testes (RF20–RF24, RF28)

-   Perguntas MCQ devem ter 1 resposta correta e 3 distratores.
-   Explicações precisam de referência ao material.
-   O sistema guarda desempenho por tópico e disciplina.

## C) Estudo em Grupo e Salas (RF14–RF18, RF41–RF44)

-   Apenas membros podem ver materiais da sala.
-   IA da sala deve respeitar guardrails de grupo.
-   Sessões coletivas devem mostrar ranking local.

## D) Projetos e Acompanhamento (RF26–RF27)

-   IA deve dividir projetos em passos sequenciais.
-   Professores podem validar entregas e verificar evolução.

## E) Turmas e Disciplinas (RF19–RF25)

-   Apenas alunos inscritos têm acesso ao conteúdo oficial.
-   A IA docente usa exclusivamente materiais aprovados.

## F) Materiais e Indexação (RF09–RF12, RF31–RF34)

-   Sistemas devem extrair texto, estrutura e tópicos do documento.
-   Versionamento deve permitir reversão.

---
