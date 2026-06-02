# Plano de Execucao - MF1 StudyFlow

Snapshot do backlog: `2026-04-19` (`studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF1 refinados/reauditados: `2026-05-31` (`studyflow/docs/planificacao/guias-bk/MF1/`).

Data de conclusão: `05-Junho-2026 às 13:00`.

## 1) Contexto principal

A `MF1` da StudyFlow e a primeira macrofase de nucleo funcional real depois das fundacoes da `MF0`.

Esta macro junta dois eixos de produto:

- estudo colaborativo entre alunos, com salas, partilhas e IA da sala;
- fluxo docente, com turmas, disciplinas, materiais oficiais, voz docente, IA limitada e publicacoes.

Ao contrario da `MF0`, que cria a base de autenticacao, perfil, areas de estudo, materiais e IA individual, a `MF1` transforma essa base numa experiencia colaborativa e numa experiencia professor/turma. A regra principal e reutilizar o que ja existe na `MF0`, sem criar estruturas paralelas nem contratos novos de autenticacao.

Stack/contrato tecnico previsto:

- Node.js + NestJS;
- React + Vite;
- MongoDB/Mongoose;
- sessao por cookie `HttpOnly`;
- frontend com `credentials: "include"`;
- separacao por modulos de dominio;
- provider de IA herdado por `AI_PROVIDER`;
- backend em `apps/api`;
- frontend em `apps/web`;
- evidence obrigatoria por BK.

---

## 2) Tutorial Git/GitHub por BK (VS Code ou Codespaces)

Esta e a rotina obrigatoria para cada BK da `MF1`. O objetivo e garantir que cada aluno trabalha sempre sobre codigo atualizado, numa branch isolada, com commits pequenos e PR para `main`.

Podes fazer isto no VS Code local ou no GitHub Codespaces. Em ambos os casos, usa o terminal integrado:

- VS Code: `Terminal > New Terminal`;
- Codespaces: abrir o repositorio da PAP no GitHub, escolher `Code > Codespaces`, entrar no codespace e usar o terminal integrado.

### Passo 1 - Pull antes de trabalhar

Antes de tocar no codigo, confirmar que estas na `main` e que tens a versao mais recente.

```bash
git status
```

Se aparecerem alteracoes tuas por guardar, nao fazer pull ainda. Primeiro confirmar se sao para commit, se sao temporarias ou se pertencem a outro BK.

Depois, ir para a `main` e atualizar:

```bash
git switch main
git pull origin main
```

Regra: a branch do BK deve nascer depois deste pull. Assim evita-se trabalhar em cima de codigo antigo.

### Passo 2 - Escolher o BK e criar a branch

Escolher o BK que vai ser implementado e criar a branch correspondente:

- `BK-MF1-01`: `feat/studyflow-mf1-01-ia-adaptativa-natalia`
- `BK-MF1-02`: `feat/studyflow-mf1-02-salas-estudo-kaua`
- `BK-MF1-03`: `feat/studyflow-mf1-03-partilhas-sala-guilherme`
- `BK-MF1-04`: `feat/studyflow-mf1-04-ia-sala-daniel`
- `BK-MF1-07`: `feat/studyflow-mf1-07-turmas-guilherme`
- `BK-MF1-08`: `feat/studyflow-mf1-08-disciplinas-natalia`
- `BK-MF1-09`: `feat/studyflow-mf1-09-materiais-oficiais-kaua`
- `BK-MF1-10`: `feat/studyflow-mf1-10-voz-docente-natalia`
- `BK-MF1-11`: `feat/studyflow-mf1-11-ia-limitada-turma-natalia`
- `BK-MF1-12`: `feat/studyflow-mf1-12-avisos-publicacoes-kaua`

Exemplo para o `BK-MF1-01`:

```bash
git switch -c feat/studyflow-mf1-01-ia-adaptativa-natalia
```

Confirmar que a branch ativa e a correta:

```bash
git branch --show-current
```

### Passo 3 - Implementar em ciclos pequenos

Antes de escrever codigo:

1. Ler o guia do BK em `docs/planificacao/guias-bk/MF1/`.
2. Confirmar dependencias e scope-out.
3. Confirmar se o BK pertence ao eixo colaborativo de alunos ou ao eixo docente/turma.
4. Adaptar paths dos guias para a estrutura real quando necessario:
    - `server/src/...` => `apps/api/src/...`;
    - `client/src/...` => `apps/web/src/...`.
5. Implementar uma parte pequena.
6. Verificar o que mudou.

Comandos uteis:

```bash
git status
git diff
```

Regra: nao misturar varios BKs na mesma branch. Uma branch, um BK.

### Passo 4 - Testar antes de commit

Correr os testes relevantes ao tipo de alteracao.

Comandos pedidos nos guias MF1:

```bash
npm run test:unit
npm run test:integration
```

Nota operacional: neste workspace, os `package.json` observados ainda nao expõem estes scripts no nivel raiz. Se os comandos ainda nao existirem quando o BK for implementado, registar como blocker de infraestrutura ou alinhar scripts antes de fechar o BK.

Se o BK tiver UI, validar tambem o fluxo no frontend e guardar evidence sanitizada, sem cookies, passwords, screenshots com dados reais ou dados pessoais de alunos.

Se um teste falhar, corrigir antes de fazer commit. Se a falha for de infraestrutura externa, registar isso nas notas/evidence.

### Passo 5 - Fazer commits claros

Ver primeiro os ficheiros alterados:

```bash
git status
```

Adicionar apenas ficheiros do BK:

```bash
git add apps/api/src/modules/caminho/do/ficheiro.ts
git add apps/web/src/caminho/do/ficheiro.tsx
git add docs/planificacao/caminho/do/ficheiro.md
```

Ou, se todas as alteracoes pertencerem mesmo ao BK:

```bash
git add .
```

Antes do commit, confirmar que nao entrou nada sensivel:

```bash
git diff --cached
```

Criar commit com mensagem curta e ligada ao BK:

```bash
git commit -m "feat(mf1-01): add adaptive learning flow"
```

Boas regras para commits:

- um commit deve representar uma unidade logica;
- nao juntar formatter, refactor grande e feature no mesmo commit sem necessidade;
- nao commitar `.env`, cookies, tokens, imagens reais ou evidence sensivel;
- se houver mais trabalho no mesmo BK, repetir ciclo: alterar, testar, `git add`, `git commit`.

### Passo 6 - Push da branch

Quando o BK estiver pronto localmente:

```bash
git push -u origin feat/studyflow-mf1-01-ia-adaptativa-natalia
```

Nos pushes seguintes da mesma branch, basta:

```bash
git push
```

### Passo 7 - Abrir PR para `main`

No GitHub:

1. Abrir o repositorio.
2. Clicar em `Compare & pull request`, ou ir a `Pull requests > New pull request`.
3. Confirmar:
    - base: `main`;
    - compare: branch do BK.
4. Titulo recomendado:

```text
BK-MF1-01 - IA adaptativa do aluno
```

5. Na descricao do PR, preencher:
    - BK implementado;
    - RF/RNF;
    - resumo tecnico;
    - ficheiros principais;
    - smoke test;
    - negativos;
    - comandos executados;
    - screenshots, se houver UI;
    - notas de seguranca/privacidade.
6. Criar Pull Request.

Regra: o PR e sempre para `main`, nunca diretamente para outra branch sem combinacao previa.

### Passo 8 - Rever checks e responder a feedback

Depois de abrir o PR:

1. Esperar pelos checks.
2. Se falharem, abrir logs e corrigir na mesma branch.
3. Fazer novo commit.
4. Fazer `git push`.

O PR atualiza automaticamente.

### Passo 9 - Depois do merge

Quando o PR for aprovado e merged:

```bash
git switch main
git pull origin main
```

Se a branch local ja nao for necessaria:

```bash
git branch -d feat/studyflow-mf1-01-ia-adaptativa-natalia
```

No proximo BK, repetir o processo desde o Passo 1.

---

## 3) BKs da MF1

Owners P0 da MF1: `Guilherme`, `Natalia` e `Kaua`.

Equipa envolvida na MF1: `Natalia`, `Guilherme`, `Kaua` e `Daniel`.

| BK          | Titulo                                                            | Owner     | Apoio     | Pri | Esforco | Dependencias             | RF   |
| ----------- | ----------------------------------------------------------------- | --------- | --------- | --- | ------- | ------------------------ | ---- |
| `BK-MF1-01` | A IA deve adaptar explicacoes ao ritmo/dificuldades do aluno      | Natalia   | Guilherme | P1  | S       | `BK-MF0-12`              | RF13 |
| `BK-MF1-02` | Criar salas de estudo com outros alunos, livres ou por disciplina | Kaua      | Guilherme | P1  | S       | `BK-MF0-03`              | RF14 |
| `BK-MF1-03` | Partilhar materiais e apontamentos na sala                        | Guilherme | Natalia   | P1  | S       | `BK-MF1-02`              | RF15 |
| `BK-MF1-04` | IA partilhada da sala, misturando areas dos membros               | Daniel    | Kaua      | P2  | S       | `BK-MF1-02`, `BK-MF1-03` | RF16 |
| `BK-MF1-07` | Criar turmas                                                      | Guilherme | Natalia   | P0  | M       | -                        | RF19 |
| `BK-MF1-08` | Criar disciplinas e associa-las as turmas                         | Natalia   | Guilherme | P0  | M       | `BK-MF1-07`              | RF20 |
| `BK-MF1-09` | Submeter materiais da disciplina, versao oficial                  | Kaua      | Natalia   | P0  | M       | `BK-MF1-08`              | RF21 |
| `BK-MF1-10` | Configurar voz textual da IA docente                              | Natalia   | Guilherme | P1  | S       | `BK-MF1-09`              | RF22 |
| `BK-MF1-11` | O aluno inscrito numa turma recebe versao limitada da IA          | Natalia   | Guilherme | P0  | M       | `BK-MF1-10`              | RF23 |
| `BK-MF1-12` | Professores podem enviar avisos e publicacoes                     | Kaua      | Guilherme | P1  | S       | `BK-MF1-07`              | RF24 |

Planeamento: `S03-S04`, com a maior parte dos BKs em `S03` e `BK-MF1-03` em `S04`.

Ordem canonica de PRs:

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

---

## 4) Regra principal obrigatoria

Antes de comecar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependencias`, `rf_rnf`, `sprint` e `proximo_bk`.
3. Confirmar se o BK pertence ao eixo colaborativo de alunos ou ao eixo docente/turma.
4. Perceber o que entra e o que fica fora.
5. Confirmar se dependencias anteriores estao merged.
6. Conseguir explicar o plano de implementacao em 2-3 frases.
7. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke;
- negativos;
- validacao tecnica;
- evidence `pr`, `proof`, `neg`;
- validacao de seguranca/privacidade quando houver dados de utilizador;
- validacao da planificacao sem drift;
- PR criado e revisto.

---

## 5) Atencao obrigatoria a paths e estrutura

A estrutura real desta PAP e:

- backend/API: `apps/api/src/...`;
- frontend: `apps/web/src/...`;
- planificacao: `docs/planificacao/...`;
- scripts: `scripts/...` e `docs/planificacao/scripts/...`.

Regra:

1. A estrutura real da app tem prioridade.
2. Adaptar qualquer referencia `server/src/...` para `apps/api/src/...`.
3. Adaptar qualquer referencia `client/src/...` para `apps/web/src/...`.
4. Nao criar duas apps paralelas.
5. Se um guia mencionar um ficheiro equivalente ja existente, editar o existente.
6. Se houver duvida de arquitetura, parar e perguntar.

Isto e blocker de arquitetura. Nao e detalhe cosmetico.

---

## 6) Dados, privacidade e variaveis de ambiente

Nunca meter segredos no repositorio.

Usar apenas `.env` local para:

- `MONGODB_URI`;
- `SESSION_SECRET` ou segredo equivalente da sessao;
- `REDIS_URL`, se Redis for usado para sessoes/cache;
- configuracoes locais de upload/storage, se existirem;
- chaves de provider IA apenas quando forem explicitamente aprovadas.

Na `MF1`, os riscos principais sao:

- dados pessoais de alunos e professores;
- ownership de areas, salas, turmas, disciplinas e materiais;
- membership de salas;
- inscricao em turmas;
- materiais oficiais e fontes usadas pela IA;
- prompts e respostas de IA;
- screenshots/evidence com dados escolares reais;
- credenciais locais de MongoDB Atlas no `BK-MF1-07`.

Antes de qualquer commit:

```bash
git status
```

Confirmar:

- `.env` nao esta staged;
- nao ha passwords, tokens, URIs privadas ou cookies reais em commits;
- evidence esta sanitizada;
- screenshots/logs nao expoem dados sensiveis;
- documentos escolares reais nao entram no repositorio;
- IDs enviados pelo frontend nao substituem ownership/membership da sessao;
- prompts internos e chaves de provider nao aparecem em logs ou PRs.

---

## 7) Ordem de execucao

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `studyflow/docs/planificacao/README.md`.
2. Confirmar hierarquia de verdade:
    - `MATRIZ-CANONICA-BK`;
    - `BACKLOG-MVP`;
    - `PLANO-SPRINTS`;
    - `SCORECARD-SPRINTS`;
    - `GUIAO-DOCENTE-SEMANAL`;
    - `GATES-S4-S8-S12`;
    - `guias-bk/*`.
3. Abrir `studyflow/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
4. Confirmar `MF1 - Nucleo funcional I`.
5. Abrir `studyflow/docs/planificacao/backlogs/MF-VIEWS.md`.
6. Confirmar sequencia:
    - `BK-MF1-01`;
    - `BK-MF1-02`;
    - `BK-MF1-03`;
    - `BK-MF1-04`;
    - `BK-MF1-07`;
    - `BK-MF1-08`;
    - `BK-MF1-09`;
    - `BK-MF1-10`;
    - `BK-MF1-11`;
    - `BK-MF1-12`.
7. Abrir `studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`.
8. Confirmar estado, dependencias, owner, apoio, prioridade, esforco, RF e sprint.
9. Abrir o guia especifico do BK em `studyflow/docs/planificacao/guias-bk/MF1/`.
10. Validar o scope-out antes de escrever codigo.
11. Implementar em ciclos curtos, mantendo PR pequeno.
12. Validar smoke + negativos + evidence.
13. Correr validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

Nota operacional: a auditoria da `MF1` registou um bloqueio externo no script de validacao por caminho inexistente para `../scripts/validate_planificacao_canonica.py`. Se esse erro ainda acontecer, registar como blocker de infraestrutura, nao como falha do BK.

---

## 8) SSOT minimo da MF1

Ler apenas as partes relevantes:

- `studyflow/docs/RF.md`
    - `RF13..RF16`;
    - `RF19..RF24`.

- `studyflow/docs/RNF.md`
    - `RNF16`: sessoes com cookies `HttpOnly + Secure + SameSite`;
    - `RNF17`: protecoes contra XSS, CSRF, injection e brute force;
    - `RNF19`: guardrails obrigatorios na IA;
    - `RNF20`: IA nao acede a dados de outras turmas ou alunos;
    - `RNF31`: IA explica fontes dos conteudos;
    - `RNF32`: IA respeita perfis distintos;
    - `RNF35`: IA nao pode inventar informacao factual;
    - `RNF42`: interface em portugues de Portugal.

- `studyflow/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - calendario macro;
    - gate `S4` para sincronizacao `MF0-MF1`.

- `studyflow/docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - linhas `BK-MF1-01..BK-MF1-12` existentes na MF1.

- `studyflow/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-07`, `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`, `BK-MF1-11`, `BK-MF1-12`;
    - snapshot por macro;
    - prioridades, owners, apoios e dependencias.

- `studyflow/docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF1 - Nucleo funcional I`;
    - ordem canonica de PRs;
    - regras de modulos acumulados.

- `studyflow/docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S03` e `S04`;
    - matriz minima de testes por prioridade;
    - gate em `S04`.

- `studyflow/docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
    - decisoes tecnicas confirmadas;
    - drift documental;
    - bloqueio conhecido no validador documental.

- Guias especificos:
    - `BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`;
    - `BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md`;
    - `BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`;
    - `BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`;
    - `BK-MF1-07-criar-turmas.md`;
    - `BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`;
    - `BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`;
    - `BK-MF1-10-configurar-voz-da-ia-docente.md`;
    - `BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`;
    - `BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`.

---

## 9) Validacao por BK

### `BK-MF1-01` - IA adaptativa do aluno

Smoke:

- guardar perfil de aprendizagem numa area de estudo propria;
- gerar explicacao adaptada com pelo menos um material `READY` com texto processavel;
- resposta devolve fontes e notas de adaptacao;
- frontend mostra carregamento, sucesso e erro da API.

Negativos:

- area de outro aluno devolve `404`;
- area sem materiais `READY` com texto processavel devolve `422`;
- provider indisponivel ou resposta invalida devolve erro controlado.

Bloqueios:

- reutilizar `StudyAreasService.getMyStudyArea`;
- usar apenas materiais `READY` com `contentText`;
- preservar `StudyToolsService`, `SummariesService`, `AiAreaProfileService` e `AI_PROVIDER`;
- nao usar turmas, disciplinas ou salas neste BK.

### `BK-MF1-02` - Salas de estudo

Smoke:

- aluno autenticado cria sala `FREE`;
- aluno autenticado cria sala `SUBJECT` com `disciplineName`;
- criador fica como primeiro membro;
- membro adicionado por email ve a sala.

Negativos:

- sala `SUBJECT` sem `disciplineName` valido devolve `400`;
- nao membro a adicionar aluno devolve `403`;
- email sem aluno existente devolve `404`;
- professor autenticado a usar fluxo de aluno devolve `403`.

Bloqueios:

- `disciplineName` e textual neste BK;
- nao importar entidade oficial de disciplinas antes do `BK-MF1-08`;
- `StudyRoomsService.ensureMember` deve ficar exportavel para `BK-MF1-03` e `BK-MF1-04`.

### `BK-MF1-03` - Partilhas na sala

Smoke:

- membro cria apontamento `NOTE` com texto utilizavel por IA;
- membro cria URL como referencia;
- membro cria `MATERIAL_REF` para material proprio da MF0;
- membros listam partilhas da sala.

Negativos:

- nao membro ou professor recebe `403`;
- `MATERIAL_REF` para material de outro aluno devolve `404`;
- partilha sem texto processavel nao alimenta IA.

Bloqueios:

- reutilizar `StudyRoomsService.ensureMember`;
- validar `MATERIAL_REF` contra materiais do proprio aluno;
- exportar `RoomSharesService` e `findUsableSharesForRoom` para `BK-MF1-04`;
- nao implementar upload, edicao, remocao ou IA da sala neste BK.

### `BK-MF1-04` - IA partilhada da sala

Smoke:

- membro pergunta a IA da sala;
- resposta devolve fontes partilhadas da sala;
- interacao fica gravada;
- frontend mostra vazio inicial, carregamento, sucesso e erro.

Negativos:

- nao membro recebe `403`;
- sala sem fontes textuais utilizaveis devolve `422`;
- `sourceIds` de outra sala nao entram nas fontes;
- provider sem resposta ou com fontes inventadas devolve `503`.

Bloqueios:

- usar apenas `RoomShare.usableByAi`;
- validar membership antes da chamada IA;
- bloquear resposta sem fontes;
- nao usar materiais privados fora da sala;
- nao misturar com voz docente.

### `BK-MF1-07` - Turmas

Smoke:

- professor cria turma com `name`, `code` e `schoolYear`;
- professor lista apenas as suas turmas;
- professor adiciona aluno existente por email;
- aluno inscrito ve a turma em `GET /api/student/classes`.

Negativos:

- aluno a criar turma devolve `403`;
- `code` duplicado nas turmas do mesmo professor devolve `409`;
- aluno nao inscrito nao ve a turma em `GET /api/student/classes`.

Bloqueios:

- `MONGODB_URI` fica apenas em `.env` local;
- seed local cria professor e aluno de desenvolvimento e recusa producao;
- `teacherId` vem sempre da sessao;
- `ClassesModule` exporta `ClassesService`;
- nao implementar importacao CSV, horarios, avaliacoes ou convites por email.

### `BK-MF1-08` - Disciplinas em turmas

Smoke:

- professor dono cria disciplina numa turma sua;
- professor lista disciplinas da turma;
- frontend mostra carregamento, vazio, sucesso e erro.

Negativos:

- professor sem ownership da turma recebe `404`;
- aluno autenticado recebe `403`;
- nome duplicado na mesma turma recebe `409`.

Bloqueios:

- disciplina guarda `classId` e `teacherId`;
- rota usa `classId` do URL;
- `teacherId` vem da sessao;
- nao criar disciplina fora de turma;
- exportar `SubjectsService` para BKs seguintes.

### `BK-MF1-09` - Materiais oficiais da disciplina

Smoke:

- professor dono cria material `TEXT` com `status: "PROCESSED"`;
- professor dono cria material `URL` com `status: "REFERENCE_ONLY"`;
- professor lista materiais oficiais da disciplina.

Negativos:

- professor sem ownership da disciplina recebe `404`;
- aluno recebe `403`;
- material `URL` nao alimenta a IA do `BK-MF1-11`;
- payload com campo livre de notas nao faz drift para schema/DTO.

Bloqueios:

- `textContent` e `sourceUrl` tem responsabilidades separadas;
- material guarda `subjectId`, `classId` e `teacherId`;
- `OfficialMaterialsModule` exporta service e schema;
- nao implementar upload pesado, extracao PDF/DOCX, versionamento ou aprovacao.

### `BK-MF1-10` - Voz textual docente

Smoke:

- professor dono guarda configuracao de voz docente com `PUT`;
- segundo `PUT` atualiza a mesma configuracao;
- configuracao fica disponivel para leitura pelo fluxo do `BK-MF1-11`.

Negativos:

- aluno recebe `403`;
- professor sem ownership da disciplina recebe `404`;
- regras vazias, excessivas ou invalidas sao validadas/normalizadas.

Bloqueios:

- voz significa estilo pedagogico textual, nao audio;
- uma configuracao por disciplina;
- `teacherId` vem da sessao;
- `TeacherAiModule` exporta `TeacherAiVoiceService`;
- nao implementar quotas, biometria, clonagem de voz ou politicas globais.

### `BK-MF1-11` - IA limitada para aluno inscrito

Smoke:

- aluno inscrito pergunta a IA da disciplina;
- resposta usa apenas materiais oficiais `PROCESSED`;
- resposta aplica voz docente textual;
- resposta devolve fontes oficiais visiveis;
- interacao fica gravada.

Negativos:

- aluno nao inscrito ou professor recebe `403`;
- disciplina sem materiais oficiais `PROCESSED` devolve `422`;
- provider indisponivel ou resposta invalida devolve erro controlado.

Bloqueios:

- inscricao e validada via `SchoolClass.studentIds`;
- fontes vem de `OfficialMaterialsService`;
- voz docente vem de `TeacherAiVoiceService`;
- importar `AiModule`, sem redefinir provider;
- nao usar materiais privados do aluno nem conhecimento externo sem fonte oficial.

### `BK-MF1-12` - Avisos e publicacoes

Smoke:

- professor dono cria aviso ou publicacao;
- professor lista publicacoes da turma;
- aluno inscrito le publicacoes da turma;
- frontend separa criacao docente e leitura do aluno.

Negativos:

- professor sem ownership da turma recebe `404`;
- aluno a criar publicacao recebe `403`;
- aluno nao inscrito a listar publicacoes recebe `403`;
- publicacoes de uma turma nao aparecem noutra turma.

Bloqueios:

- escrita exige professor dono da turma;
- leitura de aluno exige inscricao;
- `ClassPost` guarda `classId`, `teacherId`, `type`, `title` e `body`;
- nao implementar notificacoes push, comentarios, reacoes, anexos ou agendamento.

---

## 10) Evidencia obrigatoria

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Para prioridades:

- `P0`: `unit + integration + e2e` ou fluxo manual documentado e minimo `3` negativos;
- `P1`: `unit/integration` e minimo `2` negativos;
- `P2`: teste focal e minimo `1` negativo.

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- API keys;
- dados pessoais reais de alunos ou professores;
- documentos escolares reais;
- prompts internos sensiveis;
- screenshots com dados reais sensiveis;
- outputs completos de provider com informacao sensivel.

---

## 11) Decisoes tecnicas confirmadas para MF1

- `BK-MF0-12` fecha a fundacao tecnica de IA e exporta `AI_PROVIDER`.
- `BK-MF1-01` acrescenta adaptacao sem substituir contratos de IA da MF0.
- A cadeia de sala e acumulada: `BK-MF1-02` cria salas, `BK-MF1-03` acrescenta partilhas e `BK-MF1-04` acrescenta IA da sala.
- A cadeia docente e acumulada: `BK-MF1-07` turmas, `BK-MF1-08` disciplinas, `BK-MF1-09` materiais oficiais, `BK-MF1-10` voz docente, `BK-MF1-11` IA limitada e `BK-MF1-12` publicacoes.
- `teacherId`, `studentId`, ownership e membership vem da sessao/base de dados, nao de IDs livres enviados pelo frontend.
- Voz docente continua a ser estilo pedagogico textual, nao audio.
- Materiais oficiais `URL` ficam como `REFERENCE_ONLY`.
- So materiais oficiais `PROCESSED` alimentam IA factual da disciplina.
- IA privada, IA da sala e IA da turma/disciplina mantem contextos separados.
- Qualquer geracao IA da MF1 bloqueia quando nao existem fontes processaveis e autorizadas.
- `BK-MF1-11` importa `AiModule` final em vez de redefinir provider.

---

## 12) Fecho da MF1

A `MF1` so esta pronta quando:

- todos os BKs da sequencia canonica tem criterios de aceite cumpridos;
- smoke, negativos e evidence estao completos;
- nao ha drift entre matriz, backlog, guias e sprints;
- validacao documental passa ou o blocker externo fica registado;
- salas, partilhas e IA da sala funcionam sem expor dados de nao membros;
- turmas, disciplinas, materiais oficiais e publicacoes validam professor dono ou aluno inscrito;
- IA limitada usa apenas fontes oficiais autorizadas;
- `BK-MF2-01`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-06`, `BK-MF2-07` e `BK-MF2-12` ficam desbloqueados conforme dependencias.

Comando obrigatorio:

```bash
bash scripts/validate-planificacao.sh
```

Nota: se o validador continuar a falhar por ficheiro externo inexistente, registar como blocker de infraestrutura com o output sanitizado.

---

## 13) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. BK e path do guia.
3. Heading/seccao que causou duvida.
4. Erro/log relevante sem dados sensiveis.
5. O que ja tentaram.
6. Se o bloqueio e tecnico, documental, de dependencia, privacidade ou seguranca.
