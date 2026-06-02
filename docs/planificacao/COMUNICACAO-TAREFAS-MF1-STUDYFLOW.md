# Comunicação de Tarefas - MF1 StudyFlow

## 0) Identificação rápida

PAP: `StudyFlow`

Repositório: `studyflow`

Base branch: `main`

Modo de trabalho: `MF completa`

MF: `MF1 - Nucleo funcional I`

Snapshot dos documentos:

- Backlog e plano de sprints: `2026-04-19`
- Guias MF1 auditados: `2026-05-31`

Documentos principais:

- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF1/`
- `docs/RF.md`
- `docs/RNF.md`

---

## 1) Branches a usar

Antes de começar, criar sempre uma branch nova a partir de `main`.

Regra:

```text
feat/studyflow-mf1-NN-bk-slug-owner
```

Branches desta comunicação:

| Unidade | Owner | Branch |
| --- | --- | --- |
| `BK-MF1-01` - A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | `Natalia` | `feat/studyflow-mf1-01-ia-adaptativa-natalia` |
| `BK-MF1-02` - Criar salas de estudo com outros alunos (livres ou por disciplina). | `Kaua` | `feat/studyflow-mf1-02-salas-estudo-kaua` |
| `BK-MF1-03` - Partilhar materiais e apontamentos na sala. | `Guilherme` | `feat/studyflow-mf1-03-partilhas-sala-guilherme` |
| `BK-MF1-04` - IA partilhada da sala (mistura das áreas dos membros). | `Daniel` | `feat/studyflow-mf1-04-ia-sala-daniel` |
| `BK-MF1-07` - Criar turmas. | `Guilherme` | `feat/studyflow-mf1-07-turmas-guilherme` |
| `BK-MF1-08` - Criar disciplinas e associá-las às turmas. | `Natalia` | `feat/studyflow-mf1-08-disciplinas-natalia` |
| `BK-MF1-09` - Submeter materiais da disciplina (versão oficial). | `Kaua` | `feat/studyflow-mf1-09-materiais-oficiais-kaua` |
| `BK-MF1-10` - Configurar "voz da IA" docente. | `Natalia` | `feat/studyflow-mf1-10-voz-docente-natalia` |
| `BK-MF1-11` - O aluno inscrito numa turma recebe versão limitada da IA. | `Natalia` | `feat/studyflow-mf1-11-ia-limitada-turma-natalia` |
| `BK-MF1-12` - Professores podem enviar avisos e publicações. | `Kaua` | `feat/studyflow-mf1-12-avisos-publicacoes-kaua` |

---

## 2) Guia rápido: VS Code

1. Abrir o VS Code.
2. Abrir a pasta raiz do repositório `studyflow`.
3. Abrir o terminal integrado.
4. Confirmar que estás na pasta certa:

```bash
git status
```

5. Atualizar a branch principal:

```bash
git checkout main
git pull origin main
```

6. Criar a branch do BK:

```bash
git checkout -b feat/studyflow-mf1-01-ia-adaptativa-natalia
```

7. Trabalhar em ciclos curtos:

```bash
git status
git diff
```

8. Adicionar apenas ficheiros da tarefa:

```bash
git add apps/api/src/modules/...
git add apps/web/src/...
git add docs/...
```

9. Criar commit objetivo:

```bash
git commit -m "feat: add adaptive learning flow"
```

10. Enviar branch:

```bash
git push -u origin feat/studyflow-mf1-01-ia-adaptativa-natalia
```

11. Abrir Pull Request para `main`.

---

## 3) Guia rápido: GitHub Codespaces

1. Abrir o repositório no GitHub.
2. Entrar em `Code > Codespaces`.
3. Criar ou abrir um Codespace.
4. Confirmar estado:

```bash
git status
git branch
```

5. Atualizar `main`:

```bash
git checkout main
git pull origin main
```

6. Criar a branch da tarefa.
7. Instalar dependências apenas se necessário e usando o comando previsto no projeto.
8. Implementar, validar, commitar e fazer push.
9. Abrir PR para `main`.
10. Parar o Codespace quando já não for necessário.

---

## 4) Contexto principal

A `MF1` da StudyFlow corresponde ao primeiro núcleo funcional depois das fundações da `MF0`.

Nesta macro entram:

- IA individual adaptativa por área de estudo do aluno;
- salas de estudo entre alunos;
- partilha de apontamentos, URLs e referências de materiais dentro da sala;
- IA partilhada limitada às fontes textuais da sala;
- turmas oficiais criadas por professores;
- disciplinas associadas a turmas;
- materiais oficiais de disciplina;
- voz docente textual para IA;
- IA limitada para alunos inscritos numa turma/disciplina;
- avisos e publicações de professores para turmas.

Fica fora desta tarefa:

- chat em tempo real;
- moderação avançada de salas;
- uploads pesados e indexação automática de PDF/DOCX;
- catálogo global de disciplinas;
- vários professores por disciplina/turma;
- notificações push;
- comentários, reações e anexos em publicações;
- quotas, administração avançada e compliance das MF posteriores;
- geração de respostas IA sem fontes autorizadas.

Stack/contrato técnico previsto:

- frontend: `React`, `TypeScript`, `Tailwind CSS`, clientes API com `credentials: 'include'`;
- backend: `Node.js`, `NestJS`, módulos por domínio;
- base de dados: `MongoDB` com `Mongoose`;
- autenticação/autorização: sessões por cookies `HttpOnly`, `SessionGuard`, ownership/membership sempre pela sessão e base de dados;
- integrações externas: provider IA apenas através do contrato herdado `AI_PROVIDER`;
- estrutura esperada: `apps/api/`, `apps/web/`, `docs/planificacao/`;
- evidence obrigatória por BK: `sim`.

---

## 5) BKs abrangidos

Macro: `MF1 - Nucleo funcional I`

Janela planeada: `S02-S04` no plano macro; linhas da matriz concentradas em `S03` e `S04`.

| BK | Título | Owner | Apoio | Pri | Esforço | Dependências | RF | Sprint | Branch |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | A IA deve adaptar explicações ao ritmo/dificuldades do aluno. | Natalia | Guilherme | P1 | S | `BK-MF0-12` | RF13 | S03 | `feat/studyflow-mf1-01-ia-adaptativa-natalia` |
| `BK-MF1-02` | Criar salas de estudo com outros alunos (livres ou por disciplina). | Kaua | Guilherme | P1 | S | `BK-MF0-03` | RF14 | S03 | `feat/studyflow-mf1-02-salas-estudo-kaua` |
| `BK-MF1-03` | Partilhar materiais e apontamentos na sala. | Guilherme | Natalia | P1 | S | `BK-MF1-02` | RF15 | S04 | `feat/studyflow-mf1-03-partilhas-sala-guilherme` |
| `BK-MF1-04` | IA partilhada da sala (mistura das áreas dos membros). | Daniel | Kaua | P2 | S | `BK-MF1-02`, `BK-MF1-03` | RF16 | S03 | `feat/studyflow-mf1-04-ia-sala-daniel` |
| `BK-MF1-07` | Criar turmas. | Guilherme | Natalia | P0 | M | - | RF19 | S03 | `feat/studyflow-mf1-07-turmas-guilherme` |
| `BK-MF1-08` | Criar disciplinas e associá-las às turmas. | Natalia | Guilherme | P0 | M | `BK-MF1-07` | RF20 | S03 | `feat/studyflow-mf1-08-disciplinas-natalia` |
| `BK-MF1-09` | Submeter materiais da disciplina (versão oficial). | Kaua | Natalia | P0 | M | `BK-MF1-08` | RF21 | S03 | `feat/studyflow-mf1-09-materiais-oficiais-kaua` |
| `BK-MF1-10` | Configurar "voz da IA" docente. | Natalia | Guilherme | P1 | S | `BK-MF1-09` | RF22 | S03 | `feat/studyflow-mf1-10-voz-docente-natalia` |
| `BK-MF1-11` | O aluno inscrito numa turma recebe versão limitada da IA. | Natalia | Guilherme | P0 | M | `BK-MF1-10` | RF23 | S03 | `feat/studyflow-mf1-11-ia-limitada-turma-natalia` |
| `BK-MF1-12` | Professores podem enviar avisos e publicações. | Kaua | Guilherme | P1 | S | `BK-MF1-07` | RF24 | S03 | `feat/studyflow-mf1-12-avisos-publicacoes-kaua` |

Ordem canónica de PRs:

1. `BK-MF1-01`
2. `BK-MF1-02`
3. `BK-MF1-03`
4. `BK-MF1-04`
5. `BK-MF1-07`
6. `BK-MF1-08`
7. `BK-MF1-09`
8. `BK-MF1-10`
9. `BK-MF1-11`
10. `BK-MF1-12`

Regras específicas da MF1:

- Abrir cada PR apenas depois do BK anterior da mesma cadeia estar merged.
- Evitar PRs paralelos em módulos partilhados.
- `ai.module.ts` acumula `MF0 -> BK-MF1-01`.
- `study-rooms.module.ts` acumula `BK-MF1-02 -> BK-MF1-03 -> BK-MF1-04`.
- `BK-MF1-12` fica depois de `BK-MF1-11` na sequência macro, mesmo tendo dependência técnica direta em `BK-MF1-07`.

---

## 6) Regra principal obrigatória

Antes de começar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependências`, `rf_rnf`, `sprint` e `proximo_bk`.
3. Perceber o que entra e o que fica fora.
4. Confirmar se as dependências estão concluídas e merged.
5. Conseguir explicar o plano de implementação em 2-3 frases.
6. Confirmar com o professor/responsável antes de implementar ou fechar o BK, se aplicável.

Nenhum BK pode ficar `DONE` sem:

- smoke test;
- testes negativos;
- validação técnica;
- evidence `pr`, `proof`, `neg`;
- validação da planificação sem drift;
- PR criado e revisto.

---

## 7) Estrutura técnica

Estrutura esperada:

- `apps/api/` para backend;
- `apps/web/` para frontend;
- `docs/planificacao/` para documentação;
- `scripts/` e `docs/planificacao/scripts/` para validação e auditoria documental.

Regras:

1. Reutilizar a estrutura existente.
2. Não criar `server/`, `client/`, `frontend/` ou `backend/` paralelos.
3. Não misturar frameworks sem decisão explícita.
4. Não alterar contratos públicos sem confirmar impacto nos BKs dependentes.
5. Não refatorar código não relacionado com a tarefa.
6. Manter módulos coesos por domínio: `ai`, `study-rooms`, `classes`, `subjects`, `official-materials`, `teacher-ai`, `class-ai`, `class-posts`.

---

## 8) Dados, segurança e variáveis de ambiente

Nunca colocar segredos no repositório.

Usar apenas `.env` local para:

- `MONGODB_URI`;
- `SESSION_SECRET` ou segredo equivalente;
- `REDIS_URL`, se Redis for usado;
- chave do provider IA, apenas quando necessária;
- limites de upload ou configuração local.

Pontos de segurança obrigatórios:

- `.env` nunca fica staged;
- `MONGODB_URI`, tokens, API keys, cookies e host privados nunca aparecem em commits ou screenshots;
- evidence deve ser sanitizada;
- logs não expõem prompts internos, chaves, cookies ou dados pessoais;
- IDs de professor/aluno vêm da sessão, não do body;
- ownership e membership são validados no service;
- IA privada, IA da sala e IA da turma/disciplina mantêm contextos separados;
- a IA bloqueia quando não existem fontes processáveis e autorizadas.

---

## 9) Ordem de execução

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Confirmar branch base:

```bash
git checkout main
git pull origin main
```

2. Criar branch da tarefa.
3. Ler `docs/planificacao/README.md`.
4. Confirmar hierarquia canónica e regra de precedência.
5. Abrir `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
6. Confirmar `MF1 - Nucleo funcional I`.
7. Abrir `docs/planificacao/backlogs/MF-VIEWS.md`.
8. Confirmar sequência dos BKs MF1.
9. Abrir `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
10. Confirmar estado, dependências, owner, apoio, prioridade, esforço, RF/RNF e sprint.
11. Abrir o guia específico de cada BK em `docs/planificacao/guias-bk/MF1/`.
12. Validar o scope-out antes de escrever código.
13. Implementar em ciclos curtos.
14. Manter PR pequeno e focado.
15. Validar smoke, negativos e evidence.
16. Correr validação documental/técnica prevista.
17. Fazer commit e push.
18. Criar PR para `main`.

Comandos previstos pelos guias MF1:

```bash
npm run test:unit
npm run test:integration
bash scripts/validate-planificacao.sh
```

TODO_CONFIRMAR:

- Os guias MF1 pedem `npm run test:unit` e `npm run test:integration`, mas os `package.json` observados expõem apenas `apps/api: npm test` e `apps/web: npm run build`.
- A auditoria `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md` indica que `bash scripts/validate-planificacao.sh` falhava por apontar para `../scripts/validate_planificacao_canonica.py`, ficheiro ausente neste workspace.
- Confirmar/adicionar scripts de validação antes de fechar BKs como `DONE`.

---

## 10) SSOT mínimo

Documentos funcionais:

- `docs/RF.md`
    - `RF13`: IA adapta explicações ao ritmo/dificuldades do aluno;
    - `RF14`: criar salas de estudo com outros alunos;
    - `RF15`: partilhar materiais e apontamentos na sala;
    - `RF16`: IA partilhada da sala;
    - `RF19`: criar turmas;
    - `RF20`: criar disciplinas e associá-las às turmas;
    - `RF21`: submeter materiais da disciplina;
    - `RF22`: configurar voz da IA docente;
    - `RF23`: aluno inscrito recebe versão limitada da IA;
    - `RF24`: professores enviam avisos e publicações.

Documentos não funcionais relevantes:

- `docs/RNF.md`
    - `RNF16`: sessões com cookies `HttpOnly + Secure + SameSite`;
    - `RNF17`: proteção contra XSS, CSRF, injection e brute force;
    - `RNF19`: guardrails obrigatórios na IA;
    - `RNF20`: IA não acede a dados de outras turmas ou alunos;
    - `RNF31`: IA explica fontes dos conteúdos;
    - `RNF32`: IA respeita perfis distintos;
    - `RNF35`: IA não pode inventar informação factual;
    - `RNF42`: interface em português de Portugal.

Planificação:

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - calendário macro;
    - gate `S4` para sincronização `MF0-MF1`.

- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - linhas `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-07`, `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF1-12`.

- `docs/planificacao/backlogs/MF-VIEWS.md`
    - secção `MF1 - Nucleo funcional I`;
    - ordem canónica de PRs.

- `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S03` e `S04`;
    - matriz mínima de testes por prioridade.

Guias específicos:

- `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`

---

## 11) Validação por BK

### `BK-MF1-01` - IA adaptativa do aluno

Owner: `Natalia`

Apoio: `Guilherme`

Prioridade: `P1`

Branch: `feat/studyflow-mf1-01-ia-adaptativa-natalia`

Dependências:

- `BK-MF0-12`.

Scope:

- criar perfil de aprendizagem por aluno e área;
- gerar explicações adaptadas com fontes processáveis;
- preservar contratos de IA da MF0;
- guardar resposta, fontes e notas de adaptação.

Fora de scope:

- diagnóstico clínico ou psicológico;
- perfil global para todas as áreas;
- materiais oficiais de turma;
- IA partilhada de sala.

Smoke:

- guardar perfil de aprendizagem numa área própria;
- gerar explicação com pelo menos um material `READY` com texto processável;
- visualizar resposta com fontes.

Negativos:

- área de outro aluno devolve `404`;
- área sem materiais `READY` com texto processável devolve `422`;
- provider indisponível ou resposta inválida devolve erro controlado.

Validação técnica:

- `StudyAreasService.getMyStudyArea` valida ownership;
- só materiais `READY` com `contentText` entram no prompt;
- resultado do provider é validado antes de persistir.

Bloqueios ou decisões pendentes:

- confirmar scripts `test:unit` e `test:integration`;
- confirmar provider IA local sem expor chaves.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-02` - Salas de estudo

Owner: `Kaua`

Apoio: `Guilherme`

Prioridade: `P1`

Branch: `feat/studyflow-mf1-02-salas-estudo-kaua`

Dependências:

- `BK-MF0-03`.

Scope:

- criar `StudyRoom`;
- associar criador como primeiro membro;
- criar sala `FREE` ou `SUBJECT`;
- guardar `disciplineName` textual para salas por disciplina;
- adicionar membro por email;
- listar apenas salas do aluno autenticado.

Fora de scope:

- chat em tempo real;
- moderação avançada;
- papéis internos dentro da sala;
- IA da sala.

Smoke:

- aluno cria sala `FREE`;
- aluno cria sala `SUBJECT` com `disciplineName`;
- membro adicionado por email vê a sala.

Negativos:

- sala `SUBJECT` sem `disciplineName` válido devolve `400`;
- não membro a adicionar aluno devolve `403`;
- email sem aluno existente devolve `404`;
- professor no fluxo de aluno devolve `403`.

Validação técnica:

- todas as ações usam sessão autenticada;
- `StudyRoomsService.ensureMember` fica exportável;
- frontend usa `credentials: 'include'`.

Bloqueios ou decisões pendentes:

- não ligar ainda a entidade oficial de disciplinas, que nasce em `BK-MF1-08`;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-03` - Partilhas na sala

Owner: `Guilherme`

Apoio: `Natalia`

Prioridade: `P1`

Branch: `feat/studyflow-mf1-03-partilhas-sala-guilherme`

Dependências:

- `BK-MF1-02`.

Scope:

- criar `RoomShare`;
- permitir tipos `NOTE`, `URL` e `MATERIAL_REF`;
- validar autor como membro da sala;
- validar `MATERIAL_REF` contra material do próprio aluno;
- listar partilhas apenas para membros;
- expor fontes textuais para `BK-MF1-04`.

Fora de scope:

- upload de ficheiros;
- extração automática de páginas externas;
- edição e remoção de partilhas;
- IA da sala.

Smoke:

- membro cria apontamento `NOTE`;
- membro cria URL como referência;
- membro cria `MATERIAL_REF` para material próprio;
- membros listam partilhas da sala.

Negativos:

- não membro ou professor recebe `403`;
- `MATERIAL_REF` de outro aluno devolve `404`;
- partilha sem texto processável não alimenta IA.

Validação técnica:

- membership validada antes de criar e listar;
- ownership de material vem da MF0;
- `StudyRoomsModule` exporta `RoomSharesService`.

Bloqueios ou decisões pendentes:

- depende de `StudyRoomsService.ensureMember` final do `BK-MF1-02`;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-04` - IA partilhada da sala

Owner: `Daniel`

Apoio: `Kaua`

Prioridade: `P2`

Branch: `feat/studyflow-mf1-04-ia-sala-daniel`

Dependências:

- `BK-MF1-02`;
- `BK-MF1-03`.

Scope:

- criar `RoomAiInteraction`;
- validar membership antes da chamada IA;
- usar apenas `RoomShare.usableByAi`;
- permitir filtrar fontes por `sourceIds`;
- guardar pergunta, resposta e fontes.

Fora de scope:

- chat em tempo real;
- materiais privados fora da sala;
- voz docente;
- respostas sem fontes.

Smoke:

- membro pergunta à IA da sala;
- resposta devolve fontes da sala;
- interação fica gravada.

Negativos:

- não membro recebe `403`;
- sala sem fontes textuais utilizáveis devolve `422`;
- `sourceIds` de outra sala não entram nas fontes;
- provider sem resposta válida ou fontes autorizadas devolve `503`.

Validação técnica:

- `RoomSharesService.findUsableSharesForRoom` limita fontes;
- provider é isolado via `AI_PROVIDER`;
- resposta é validada antes de persistir.

Bloqueios ou decisões pendentes:

- `BK-MF1-03` tem de estar merged;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- teste focal e negativos concluídos;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-07` - Turmas

Owner: `Guilherme`

Apoio: `Natalia`

Prioridade: `P0`

Branch: `feat/studyflow-mf1-07-turmas-guilherme`

Dependências:

- sem dependência direta na matriz;
- herda `User`, `SessionGuard` e autenticação da MF0.

Scope:

- preparar ligação local ao MongoDB Atlas;
- criar seed local de professor e aluno de desenvolvimento;
- criar `SchoolClass`;
- listar turmas do professor autenticado;
- adicionar aluno existente à turma por email;
- listar turmas do aluno autenticado;
- garantir ownership e inscrição pela sessão/base de dados.

Fora de scope:

- importação CSV;
- horários, avaliações e sumários;
- convites por email com token;
- vários professores na mesma turma;
- gestão real de papéis em produção;
- configuração cloud avançada.

Smoke:

- professor cria turma com `name`, `code` e `schoolYear`;
- professor adiciona aluno existente por email;
- aluno inscrito vê a turma.

Negativos:

- aluno a criar turma devolve `403`;
- `code` duplicado no mesmo professor devolve `409`;
- aluno não inscrito não vê a turma.

Validação técnica:

- `.env` local não entra no Git;
- seed recusa produção;
- `teacherId` vem da sessão;
- `ClassesModule` exporta `ClassesService`.

Bloqueios ou decisões pendentes:

- confirmar credenciais Atlas locais sem expor segredos;
- confirmar scripts de teste e validador documental.

Critério de conclusão:

- implementação concluída;
- unit, integration e e2e/fluxo manual documentado;
- pelo menos 3 negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-08` - Disciplinas em turmas

Owner: `Natalia`

Apoio: `Guilherme`

Prioridade: `P0`

Branch: `feat/studyflow-mf1-08-disciplinas-natalia`

Dependências:

- `BK-MF1-07`.

Scope:

- criar `Subject`;
- associar disciplina a `SchoolClass`;
- validar que a turma pertence ao professor autenticado;
- evitar nomes duplicados dentro da mesma turma;
- exportar service e schema para BKs seguintes.

Fora de scope:

- catálogo global de disciplinas;
- vários professores por disciplina;
- programa curricular completo;
- materiais oficiais.

Smoke:

- professor dono cria disciplina numa turma sua;
- professor lista disciplinas da turma;
- frontend mostra lista e estado vazio.

Negativos:

- professor sem ownership da turma recebe `404`;
- aluno recebe `403`;
- nome duplicado na mesma turma recebe `409`.

Validação técnica:

- disciplina guarda `classId` e `teacherId`;
- rota usa `classId` do URL;
- `teacherId` vem da sessão;
- não existe criação fora de turma.

Bloqueios ou decisões pendentes:

- `BK-MF1-07` precisa de professor/turma de desenvolvimento funcionais;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- unit, integration e e2e/fluxo manual documentado;
- pelo menos 3 negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-09` - Materiais oficiais da disciplina

Owner: `Kaua`

Apoio: `Natalia`

Prioridade: `P0`

Branch: `feat/studyflow-mf1-09-materiais-oficiais-kaua`

Dependências:

- `BK-MF1-08`.

Scope:

- criar `OfficialMaterial`;
- submeter material `TEXT` ou `URL`;
- marcar `TEXT` como `PROCESSED`;
- marcar `URL` como `REFERENCE_ONLY`;
- listar materiais oficiais de uma disciplina do professor.

Fora de scope:

- upload de ficheiros pesados;
- extração automática de PDF/DOCX;
- versionamento e reversão;
- aprovação por coordenação escolar.

Smoke:

- professor cria material `TEXT`;
- professor cria material `URL`;
- professor lista materiais da disciplina.

Negativos:

- professor sem ownership da disciplina recebe `404`;
- aluno recebe `403`;
- material `URL` fica `REFERENCE_ONLY` e não alimenta `BK-MF1-11`;
- payload com campo livre de notas não faz drift.

Validação técnica:

- `textContent` e `sourceUrl` têm responsabilidades separadas;
- material guarda `subjectId`, `classId` e `teacherId`;
- `OfficialMaterialsModule` exporta service e schema.

Bloqueios ou decisões pendentes:

- `BK-MF1-08` precisa de disciplina funcional;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- unit, integration e e2e/fluxo manual documentado;
- pelo menos 3 negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-10` - Voz textual docente

Owner: `Natalia`

Apoio: `Guilherme`

Prioridade: `P1`

Branch: `feat/studyflow-mf1-10-voz-docente-natalia`

Dependências:

- `BK-MF1-09`.

Scope:

- criar `TeacherAiVoice`;
- guardar tom, nível de detalhe e regras;
- garantir uma configuração por disciplina;
- expor `PUT` para criação/atualização;
- disponibilizar leitura para `BK-MF1-11`.

Fora de scope:

- áudio, clonagem de voz ou biometria;
- múltiplas vozes por disciplina;
- políticas globais de IA;
- quotas de IA.

Smoke:

- professor dono guarda configuração;
- segundo `PUT` atualiza a mesma configuração;
- configuração pode ser lida para a disciplina.

Negativos:

- aluno recebe `403`;
- professor sem ownership da disciplina recebe `404`;
- regras vazias ou excessivas são validadas/normalizadas.

Validação técnica:

- `teacherId` vem da sessão;
- controller e cliente usam `PUT`;
- `TeacherAiModule` exporta `TeacherAiVoiceService`.

Bloqueios ou decisões pendentes:

- `BK-MF1-09` deve estar merged;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-11` - IA limitada para aluno inscrito

Owner: `Natalia`

Apoio: `Guilherme`

Prioridade: `P0`

Branch: `feat/studyflow-mf1-11-ia-limitada-turma-natalia`

Dependências:

- `BK-MF1-10`.

Scope:

- criar interação de IA por disciplina;
- confirmar inscrição do aluno na turma da disciplina;
- usar apenas materiais oficiais `PROCESSED`;
- aplicar voz docente textual;
- gravar pergunta, resposta e fontes oficiais.

Fora de scope:

- chat em tempo real;
- materiais privados do aluno;
- conhecimento externo sem fonte oficial;
- IA para aluno não inscrito.

Smoke:

- aluno inscrito pergunta à IA da disciplina;
- resposta inclui fontes oficiais visíveis;
- interação fica gravada.

Negativos:

- aluno não inscrito ou professor recebe `403`;
- disciplina sem materiais oficiais `PROCESSED` devolve `422`;
- provider indisponível ou resposta inválida devolve erro controlado.

Validação técnica:

- inscrição é validada via `SchoolClass.studentIds`;
- fontes vêm de `OfficialMaterialsService`;
- voz docente vem de `TeacherAiVoiceService`;
- `AiModule` é importado, sem redefinir provider.

Bloqueios ou decisões pendentes:

- `BK-MF1-10` deve exportar serviço de voz docente;
- confirmar scripts de teste e provider local.

Critério de conclusão:

- implementação concluída;
- unit, integration e e2e/fluxo manual documentado;
- pelo menos 3 negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-12` - Avisos e publicações

Owner: `Kaua`

Apoio: `Guilherme`

Prioridade: `P1`

Branch: `feat/studyflow-mf1-12-avisos-publicacoes-kaua`

Dependências:

- `BK-MF1-07`.

Scope:

- criar `ClassPost`;
- criar aviso ou publicação;
- listar publicações para professor dono da turma;
- listar publicações para aluno inscrito;
- separar cliente frontend docente e cliente de leitura do aluno.

Fora de scope:

- notificações push;
- comentários e reações;
- anexos;
- agendamento de publicações.

Smoke:

- professor dono cria aviso;
- professor lista publicações da turma;
- aluno inscrito lê aviso.

Negativos:

- professor sem ownership da turma recebe `404`;
- aluno a criar publicação recebe `403`;
- aluno não inscrito a listar recebe `403`;
- publicações de uma turma não aparecem noutra.

Validação técnica:

- escrita exige professor dono;
- leitura de aluno exige inscrição;
- `ClassPost` guarda `classId`, `teacherId`, `type`, `title` e `body`;
- chamadas usam `credentials: 'include'`.

Bloqueios ou decisões pendentes:

- `BK-MF1-07` deve estar funcional com professor/aluno inscritos;
- confirmar scripts de teste.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

---

## 12) Evidence obrigatória

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Mínimo por prioridade:

- `P0`: `unit + integration + e2e` ou fluxo manual documentado, mínimo `3` negativos;
- `P1`: `unit/integration`, mínimo `2` negativos;
- `P2`: teste focal do fluxo alterado, mínimo `1` negativo.

Comandos esperados pela planificação:

```bash
npm run test:unit
npm run test:integration
bash scripts/validate-planificacao.sh
```

Quando o BK não pedir E2E, manter pelo menos:

```bash
npm run test:unit
npm run test:integration
```

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- API keys;
- prompts internos sensíveis;
- dados pessoais de alunos;
- documentos escolares reais não sanitizados;
- screenshots com dados reais sensíveis.

---

## 13) Template de evidence por BK

````md
## Evidence - BK-MF1-XX Título

### PR

- URL: TODO_CONFIRMAR
- Branch: feat/studyflow-mf1-XX-slug-owner
- Base: main

### Proof

- TODO_CONFIRMAR
- TODO_CONFIRMAR
- TODO_CONFIRMAR

### Negativos

- TODO_CONFIRMAR
- TODO_CONFIRMAR
- TODO_CONFIRMAR

### Ficheiros alterados

- TODO_CONFIRMAR
- TODO_CONFIRMAR
- TODO_CONFIRMAR

### Comandos executados

```bash
npm run test:unit
npm run test:integration
bash scripts/validate-planificacao.sh
```

### Screenshots

- TODO_CONFIRMAR
- TODO_CONFIRMAR

### Notas

- TODO_CONFIRMAR
````

---

## 14) Template de PR

```md
## Objetivo

Implementa `BK-MF1-XX - Título` no âmbito de `MF1 - Nucleo funcional I`.

## Alterações

- TODO_CONFIRMAR
- TODO_CONFIRMAR
- TODO_CONFIRMAR

## Validação

- [ ] Smoke test concluído
- [ ] Testes negativos concluídos
- [ ] Testes unitários/integrados executados
- [ ] Validação documental executada ou bloqueio justificado
- [ ] Evidence preenchida
- [ ] Sem segredos ou dados sensíveis no commit
- [ ] Sem drift documental

## Evidence

- `pr`: TODO_CONFIRMAR
- `proof`: TODO_CONFIRMAR
- `neg`: TODO_CONFIRMAR
- `files`: TODO_CONFIRMAR
- `commands`: TODO_CONFIRMAR
- `screenshots`: TODO_CONFIRMAR
- `notes`: TODO_CONFIRMAR

## Dependências e notas

- Dependências confirmadas: TODO_CONFIRMAR
- Bloqueios: TODO_CONFIRMAR
- Fora de scope: TODO_CONFIRMAR
```

---

## 15) Checklist final antes de enviar ao grupo

- [x] PAP correta.
- [x] MF correta.
- [x] Branches preenchidas no topo.
- [x] Owners e apoios preenchidos a partir da matriz/backlog.
- [x] Dependências preenchidas a partir da matriz/backlog.
- [x] RF relevantes confirmados.
- [x] Scope e fora de scope claros.
- [x] Guia VS Code incluído.
- [x] Guia Codespaces incluído.
- [x] Validação por BK incluída.
- [x] Evidence obrigatória incluída.
- [x] Template de PR incluído.
- [x] `TODO_CONFIRMAR` usado onde falta informação operacional.
- [ ] Confirmar scripts reais de testes no workspace.
- [ ] Confirmar correção do validador documental antes do gate.
