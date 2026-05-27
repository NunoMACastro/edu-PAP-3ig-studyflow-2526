# Plano de Execução - MF0 StudyFlow

Snapshot do backlog: `2026-04-19` (`studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF0 refinados: `2026-05-25` (`studyflow/docs/planificacao/guias-bk/MF0/`).

## 1) Contexto principal

A `MF0` da StudyFlow é uma fase de **fundações de plataforma** e já inclui implementação real.

Nesta macro entram as bases de:

- registo de aluno;
- login seguro;
- perfil de aluno;
- estudo individual sem turma;
- rotinas e objetivos;
- histórico de estudo;
- áreas de estudo;
- submissão de materiais;
- voz textual/pedagógica da IA;
- perfil IA por área;
- resumos IA com fontes processáveis;
- explicações, cards e quizzes personalizados.

Stack/contrato técnico previsto nos documentos:

- frontend modular em React/TypeScript/Tailwind;
- backend Node.js LTS com NestJS;
- MongoDB com Mongoose;
- Redis para cache/sessões quando aplicável;
- autenticação por cookies `HttpOnly`;
- módulos por domínio: auth, students, study, study-areas, materials, ai;
- evidence obrigatória por BK.

---

## 2) BKs da MF0

Macro: `MF0 - Fundações de plataforma`

Janela planeada: `S01-S02` nos BKs da MF0, com macro referida no plano como janela `S01-S03`.

| BK          | Título                                      | Owner     | Apoio     | Pri | Esforço | Dependências             | RF   | Sprint |
| ----------- | ------------------------------------------- | --------- | --------- | --- | ------- | ------------------------ | ---- | ------ |
| `BK-MF0-01` | Registo do aluno                            | Natalia   | Guilherme | P0  | M       | -                        | RF01 | S01    |
| `BK-MF0-02` | Login seguro com cookies HttpOnly           | Natalia   | Guilherme | P0  | M       | -                        | RF02 | S01    |
| `BK-MF0-03` | Perfil editável                             | Guilherme | Natalia   | P1  | S       | `BK-MF0-02`              | RF03 | S01    |
| `BK-MF0-04` | Estudar sem turma                           | Natalia   | Guilherme | P0  | M       | `BK-MF0-03`              | RF04 | S01    |
| `BK-MF0-05` | Rotinas e objetivos de estudo               | Guilherme | Natalia   | P1  | S       | `BK-MF0-03`              | RF05 | S01    |
| `BK-MF0-06` | Histórico de estudo                         | Kaua      | Guilherme | P1  | S       | `BK-MF0-03`              | RF06 | S01    |
| `BK-MF0-07` | Áreas de Estudo                             | Guilherme | Guilherme | P0  | M       | `BK-MF0-03`              | RF07 | S01    |
| `BK-MF0-08` | Submeter materiais                          | Kaua      | Guilherme | P0  | M       | `BK-MF0-07`              | RF08 | S01    |
| `BK-MF0-09` | Voz textual da IA                           | Guilherme | Natalia   | P1  | S       | `BK-MF0-07`              | RF09 | S02    |
| `BK-MF0-10` | Perfil IA da Área de Estudo                 | Daniel    | Guilherme | P0  | M       | `BK-MF0-08`              | RF10 | S01    |
| `BK-MF0-11` | Resumos IA baseados nos materiais           | Natalia   | Guilherme | P0  | M       | `BK-MF0-08`, `BK-MF0-10` | RF11 | S02    |
| `BK-MF0-12` | Explicações, cards e quizzes personalizados | Natalia   | Guilherme | P0  | M       | `BK-MF0-11`              | RF12 | S02    |

Usar os nomes canónicos do backlog: `Natalia`, `Guilherme`, `Kaua`, `Daniel`.

---

## 3) Regra principal obrigatória

Antes de começar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependências`, `rf_rnf`, `sprint` e `proximo_bk`.
3. Perceber o que entra e o que fica fora.
4. Conseguir explicar o plano de implementação em 2-3 frases.
5. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke;
- negativos;
- validação técnica;
- evidence `pr`, `proof`, `neg`;
- validação da planificação sem drift.

---

## 4) Estrutura técnica

Os guias da MF0 assumem a estrutura:

- `apps/api/` para backend;
- `apps/web/` para frontend.

Regra:

1. Se ainda não existir scaffold, o `BK-MF0-01` cria a estrutura inicial.
2. Os BKs seguintes devem reutilizar essa estrutura.
3. Não criar estruturas paralelas como `server/` ou `client/` sem aprovação.
4. Não misturar padrões de framework sem decisão explícita.

Como a stack recomendada aponta para NestJS, TypeScript e Mongoose, manter o backend organizado por módulos e evitar controllers gigantes.

---

## 5) Dados e variáveis de ambiente

Nunca meter segredos no repositório.

Usar apenas `.env` local para:

- `MONGODB_URI`;
- `SESSION_SECRET` ou segredo equivalente;
- `REDIS_URL`, se Redis for usado para sessões/cache;
- chaves de provider IA, apenas quando um BK realmente exigir chamada externa;
- limites de upload, se configuráveis.

Antes de commit:

```bash
git status
```

Confirmar:

- `.env` não está staged;
- não há tokens, API keys, cookies reais ou URIs privadas;
- evidence está sanitizada;
- logs não expõem prompts internos, chaves ou dados pessoais;
- uploads de teste não incluem documentos sensíveis.

---

## 6) Ordem de execução

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `studyflow/docs/planificacao/README.md`.
2. Confirmar hierarquia canónica e regra de precedência.
3. Abrir `studyflow/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
4. Confirmar `MF0 - Fundações de plataforma`.
5. Abrir `studyflow/docs/planificacao/backlogs/MF-VIEWS.md`.
6. Confirmar sequência `BK-MF0-01..BK-MF0-12`.
7. Abrir `studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`.
8. Confirmar estado, dependências, owner, apoio, prioridade, esforço, RF e sprint.
9. Abrir o guia específico do BK em `studyflow/docs/planificacao/guias-bk/MF0/`.
10. Validar o scope-out antes de escrever código.
11. Implementar em ciclos curtos, mantendo PR pequeno.
12. Validar smoke + negativos + evidence.
13. Correr validação documental:

```bash
bash scripts/validate-planificacao.sh
```

---

## 7) SSOT mínimo da MF0

Ler apenas as partes relevantes:

- `studyflow/docs/RF.md`
    - `RF01..RF12`.

- `studyflow/docs/RNF.md`
    - `RNF15`: passwords com hashing seguro;
    - `RNF16`: cookies `HttpOnly + Secure + SameSite`;
    - `RNF18`: processamento de documentos em sandbox seguro;
    - `RNF19`: guardrails obrigatórios na IA;
    - `RNF20`: IA não acede a dados de outras turmas ou alunos;
    - `RNF31` e `RNF35`: fontes, explicabilidade e anti-alucinação.

- `studyflow/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - calendário macro;
    - gates `S4`, `S8`, `S12`.

- `studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF0-01..BK-MF0-12`;
    - snapshot por macro.

- `studyflow/docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF0 - Fundacoes de plataforma`.

- `studyflow/docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S01`, `S02`;
    - matriz mínima de testes por prioridade.

- Guias específicos:
    - `BK-MF0-01-registo-do-aluno-email-password-ou-sso-escolar.md`;
    - `BK-MF0-02-login-seguro-com-cookies-httponly.md`;
    - `BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md`;
    - `BK-MF0-04-o-aluno-pode-estudar-sem-turma.md`;
    - `BK-MF0-05-o-aluno-pode-criar-rotinas-e-objetivos-de-estudo.md`;
    - `BK-MF0-06-o-aluno-pode-consultar-historico-de-estudo.md`;
    - `BK-MF0-07-criar-areas-de-estudo-auto-disciplina-independente.md`;
    - `BK-MF0-08-submeter-materiais-pdf-docx-urls-topicos.md`;
    - `BK-MF0-09-associar-estilo-tom-das-aulas-voz-da-ia.md`;
    - `BK-MF0-10-criar-perfil-ia-da-area-de-estudo.md`;
    - `BK-MF0-11-obter-resumos-ia-baseados-nos-materiais-enviados.md`;
    - `BK-MF0-12-obter-explicacoes-cards-e-quizzes-personalizados.md`.

---

## 8) Validação por BK

### `BK-MF0-01` - Registo do aluno

Smoke:

- criar aluno com email novo e password válida;
- resposta `201` com `id`, `email` e `role`.

Negativos:

- email sem `@` => `400`;
- password abaixo do mínimo definido => `400`;
- email já registado => `409`;
- `passwordHash` nunca aparece em resposta JSON.

Bloqueios:

- SSO escolar fica `TODO (BLOCKER)` até existir fornecedor, protocolo, campos e ambiente de testes;
- password nunca pode ser guardada em texto puro;
- `role` deve ser definido pelo backend como `STUDENT`.

### `BK-MF0-02` - Login seguro

Smoke:

- login com email/password válidos;
- `GET /api/auth/me` devolve utilizador autenticado;
- logout invalida sessão.

Negativos:

- password errada => `401`;
- email inexistente => erro genérico `401`;
- cookie `sid` inválido => `401`;
- frontend sem tokens em `localStorage`.

Validação técnica:

- cookie tem `HttpOnly`;
- cookie tem `SameSite`;
- `Secure` fica ativo em produção.

### `BK-MF0-03` - Perfil editável

Smoke:

- aluno autenticado edita nome e curso;
- aluno guarda perfil sem turma.

Negativos:

- pedido sem cookie => `401`;
- body com `role: "ADMIN"` => campo rejeitado/ignorado;
- dados de outro utilizador não podem ser lidos por ID manual.

Validação técnica:

- `StudentProfile.userId` é único;
- controller não recebe `userId` pelo body;
- `turma` é opcional.

### `BK-MF0-04` - Estudo sem turma

Smoke:

- aluno autenticado sem turma acede a `/app/estudo`;
- API devolve `hasClass: false`.

Negativos:

- pedido sem cookie => `401`;
- sessão de outro aluno com `userId` no query/body => ignorado/rejeitado;
- perfil sem turma continua a devolver `200`.

Regra:

- nenhuma rota individual deve exigir `turmaId`.

### `BK-MF0-05` - Rotinas e objetivos

Smoke:

- criar rotina válida;
- criar objetivo válido.

Negativos:

- `targetMinutes: 0` => `400`;
- editar rotina de outro aluno => `404` ou `403`;
- não aceitar `userId` vindo do body.

Validação técnica:

- todas as queries filtram por `userId`;
- datas na UI seguem `dd/mm/aaaa`;
- notificações ficam fora deste BK.

### `BK-MF0-06` - Histórico de estudo

Smoke:

- aluno vê histórico vazio;
- aluno vê eventos ordenados quando existem.

Negativos:

- pedido sem cookie => `401`;
- filtrar por `userId` de outro aluno => filtro ignorado/rejeitado.

Validação técnica:

- eventos ordenados por `createdAt desc`;
- API suporta limite de resultados;
- histórico nunca aceita `userId` vindo do cliente.

### `BK-MF0-07` - Áreas de Estudo

Smoke:

- criar área válida;
- abrir detalhe da área criada.

Negativos:

- nome vazio => `400`;
- pedido sem sessão => `401`;
- abrir área de outro aluno => `404` ou `403`.

Validação técnica:

- todas as queries filtram por `userId`;
- `studyAreaId` é estável para BKs seguintes;
- áreas não dependem de turmas.

### `BK-MF0-08` - Submeter materiais

Smoke:

- submeter PDF válido;
- submeter URL válida;
- submeter tópico manual.

Negativos:

- ficheiro `.exe` => `400`;
- ficheiro acima do limite => `413` ou `400`;
- `studyAreaId` de outro aluno => `404` ou `403`.

Validação técnica:

- PDF/DOCX/URL entram como `PENDING_PROCESSING`;
- tópico manual com texto válido entra como `READY`;
- `contentText` só é preenchido para tópico/texto manual na MF0;
- paths absolutos de storage não são expostos.

Bloqueio:

- processamento seguro/sandbox completo depende de `RNF18` em fase posterior.

### `BK-MF0-09` - Voz textual da IA

Smoke:

- guardar tom `step_by_step`;
- reabrir área e ver tom persistido.

Negativos:

- tom fora da lista => `400`;
- editar área de outro aluno => `404` ou `403`.

Regra:

- "voz" significa estilo textual/pedagógico;
- não criar áudio, clonagem de voz ou dados biométricos;
- notas livres têm limite e sanitização.

### `BK-MF0-10` - Perfil IA da área

Smoke:

- criar perfil para área com fonte processável;
- ver painel com estado pronto;
- criar perfil para área apenas com materiais pendentes;
- ver painel com estado a aguardar processamento.

Negativos:

- área sem materiais => `MISSING_MATERIALS`;
- área apenas com PDF/DOCX/URL `PENDING_PROCESSING` => `PENDING_PROCESSING`;
- área de outro aluno => `404` ou `403`;
- criar perfil duas vezes não duplica.

Regra:

- um perfil por área;
- este BK não chama provider IA;
- perfil só inclui fontes da área do aluno.

### `BK-MF0-11` - Resumos IA

Smoke:

- gerar resumo com fonte processável;
- consultar resumo guardado.

Negativos:

- área sem fontes processáveis => `409` ou `422`;
- PDF/DOCX sem texto extraído ou sem indexação completa => mensagem clara, sem chamada ao provider IA;
- área de outro aluno => `404` ou `403`;
- provider IA indisponível => `503` controlado.

Bloqueios:

- resumo factual de PDF/DOCX depende de texto extraído/indexado;
- contrato de RAG/indexação completa fica para fase posterior;
- não fazer fallback para resumo genérico inventado.

### `BK-MF0-12` - Explicações, cards e quizzes

Smoke:

- gerar explicação com fonte;
- gerar cards com fonte;
- gerar quiz com fonte.

Negativos:

- área sem fontes processáveis => `409` ou `422`;
- PDF/DOCX sem texto extraído ou sem indexação completa => mensagem clara, sem chamada ao provider IA;
- provider devolve quiz com 2 respostas corretas => artefacto rejeitado;
- área de outro aluno => `404` ou `403`.

Validação técnica:

- todos os artefactos guardam fontes;
- quiz passa validador estrutural;
- sem exposição de API keys ou prompts internos;
- adaptação avançada ao ritmo fica para `BK-MF1-01`.

---

## 9) Evidence obrigatória

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Para prioridades:

- `P0`: `unit + integration + e2e` e mínimo `3` negativos;
- `P1`: `unit/integration` e mínimo `2` negativos;
- `P2`: teste focal e mínimo `1` negativo.

Comandos esperados nos guias:

```bash
npm test
npm run test:e2e
npm run lint
```

Quando o BK não pedir E2E, manter pelo menos `npm test` e `npm run lint`.

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- API keys;
- prompts internos sensíveis;
- dados pessoais de alunos;
- documentos escolares reais não sanitizados.

---

## 10) Branches recomendadas

- `BK-MF0-01`: `feat/studyflow-mf0-01-registo-natalia`
- `BK-MF0-02`: `feat/studyflow-mf0-02-login-natalia`
- `BK-MF0-03`: `feat/studyflow-mf0-03-perfil-guilherme`
- `BK-MF0-04`: `feat/studyflow-mf0-04-estudo-sem-turma-natalia`
- `BK-MF0-05`: `feat/studyflow-mf0-05-rotinas-guilherme`
- `BK-MF0-06`: `feat/studyflow-mf0-06-historico-kaua`
- `BK-MF0-07`: `feat/studyflow-mf0-07-areas-estudo-guilherme`
- `BK-MF0-08`: `feat/studyflow-mf0-08-materiais-kaua`
- `BK-MF0-09`: `feat/studyflow-mf0-09-voz-ia-guilherme`
- `BK-MF0-10`: `feat/studyflow-mf0-10-perfil-ia-daniel`
- `BK-MF0-11`: `feat/studyflow-mf0-11-resumos-ia-natalia`
- `BK-MF0-12`: `feat/studyflow-mf0-12-study-tools-natalia`

Como criar branch:

```bash
git checkout -b feat/studyflow-mf0-01-registo-natalia
```

Isto cria e muda para a branch.
Depois de implementar, criar PR para `main` e preencher evidence.

Para criar um PR:

1. Push da branch local para remoto:

```bash
git push origin feat/studyflow-mf0-01-registo-natalia
```

2. Ir ao GitHub, abrir PR da branch para `main`.
3. Preencher título, descrição e evidence.
4. Criar Pull Request.

---

## 11) Fecho da MF0

A `MF0` só está pronta quando:

- todos os BKs `BK-MF0-01..12` têm critérios de aceite cumpridos;
- smoke, negativos e evidence estão completos;
- não há drift entre matriz, backlog, guias e sprints;
- validação documental passa;
- conta, sessão, perfil, estudo individual, áreas, materiais e IA inicial estão coerentes;
- SSO, sandbox completo, indexação/RAG completa e adaptação avançada ficam explicitamente marcados como fora de scope quando ainda não existirem;
- `BK-MF1-01` fica desbloqueado para adaptação ao ritmo/dificuldades do aluno.

Comando obrigatório:

```bash
bash scripts/validate-planificacao.sh
```

---

## 12) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. BK e path do guia.
3. heading/secção que causou dúvida.
4. erro/log relevante sem dados sensíveis.
5. o que já tentaram.
6. se o bloqueio é técnico, documental, de dependência, segurança ou IA/fontes.
