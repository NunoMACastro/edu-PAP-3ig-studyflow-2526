# BK-MF0-03 - Perfil editável (nome, ano, curso, turma).

## Header
- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF0-02`
- `rf_rnf`: `RF03`
- `fase_documental`: `Fase 1`
- `sprint`: `S01`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-perfil-editavel-nome-ano-curso-turma.md`
- `last_updated`: `2026-05-25`

## O que vamos fazer neste BK

Neste BK vamos permitir que o aluno autenticado consulte e edite o seu perfil com `nome`, `ano`, `curso` e `turma`. O perfil fica ligado ao `User` criado no registo e acedido através da sessão segura criada no login.

O campo `turma` deve ser opcional nesta fase, porque o RF04 exige que o aluno possa estudar sem turma. Isto é uma decisão importante de continuidade: não se deve bloquear a entrada do aluno na app por ainda não estar inscrito numa turma.

Como ainda não existe código, os caminhos indicados são uma proposta técnica compatível com a stack recomendada. O mockup só cobre autenticação, por isso os ecrãs de perfil devem usar placeholders simples e linguagem em português de Portugal.

## Porque é que isto é importante

- Dá contexto pessoal mínimo aos BKs seguintes.
- Prepara o estudo sem turma ao tornar `turma` opcional.
- Cria a primeira rota protegida reutilizando `SessionGuard`.
- Ensina a diferença entre identidade de conta e dados editáveis de perfil.
- Reduz risco de manipulação ao impedir que o aluno edite `role`, `id` ou dados de sessão.

## O que entra (scope)

- Estado esperado antes do BK: login funcional ou contrato de sessão definido no BK-MF0-02.
- Estado esperado depois do BK: aluno autenticado consegue ver e atualizar o próprio perfil.
- Ficheiros a criar/editar:
  - `apps/api/src/modules/students/schemas/student-profile.schema.ts`
  - `apps/api/src/modules/students/student-profile.controller.ts`
  - `apps/api/src/modules/students/student-profile.service.ts`
  - `apps/api/src/modules/students/dto/update-student-profile.dto.ts`
  - `apps/web/src/pages/student/ProfilePage.tsx`
  - `apps/web/src/hooks/useSession.ts`
- Ficheiros a rever: `docs/RF.md`, `docs/RNF.md`, `BK-MF0-02`.
- Dependências de BK anteriores: `BK-MF0-02`, para obter o utilizador autenticado.
- Impacto na arquitetura: cria domínio `students` separado de `auth`.
- Impacto em frontend: cria formulário protegido de perfil.
- Impacto em backend: cria endpoints derivados `GET /api/students/me/profile` e `PATCH /api/students/me/profile`.
- Impacto em dados: cria `StudentProfile` ligado a `User`.
- Impacto em segurança: aluno só edita o próprio perfil.
- Impacto em testes: requer teste de rota protegida e validação de campos.
- Handoff: BK-MF0-04 deve usar `profile.turma` como opcional.

## O que não entra (scope-out)

- Criar turmas reais ou inscrição em turma, que ficam para MF1.
- Permitir editar email/password, porque pertence a auth/account settings futuros.
- Permitir editar role ou permissões.
- Criar dados académicos avançados, métricas ou preferências de IA.

## Como saber que isto ficou bem

- Aluno autenticado vê o próprio perfil.
- Atualização válida guarda `nome`, `ano`, `curso` e `turma` opcional.
- Pedido sem sessão devolve `401`.
- Tentativa de alterar `role` ou `userId` é ignorada ou rejeitada.
- Interface mostra estado de erro e sucesso sem perder dados do formulário.

## Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO)
- Estado: `TODO` (CANONICO)
- Esforco: `S` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Guilherme` (CANONICO)
- Apoio: `Natalia` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-02` (CANONICO)
- Pre-condicoes: sessão segura ou contrato de sessão preparado (DERIVADO)
- Ref. Plano: `Fase 1`, `S01`, `Core` (CANONICO)
- Flow ID: `FLOW-MF0-STUDENT-PROFILE`
- Fonte de verdade: `docs/RF.md`, `RF03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`, `BK-MF0-03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Perfil editável do aluno com turma opcional (CANONICO/DERIVADO)
- `rf_rnf`: `RF03` (CANONICO)

## O que vamos fazer neste BK (DERIVADO):

- Criar modelo `StudentProfile`.
- Criar DTO de atualização.
- Criar endpoints protegidos de leitura e atualização.
- Criar formulário de perfil no frontend.
- Garantir que `turma` é opcional.
- Bloquear edição de campos sensíveis.
- Preparar contrato para estudo individual sem turma.

## Pre-leitura mínima (10-15 min) (DERIVADO):

- `docs/RF.md`: RF03 e RF04.
- `docs/RNF.md`: RNF06, RNF25, RNF26, RNF42.
- `BK-MF0-02`: sessão, cookie e `SessionGuard`.
- `BACKLOG-MVP.md`: linha `BK-MF0-03`.
- `MF-VIEWS.md`: sequência da MF0.
- Mockup: apenas para padrão visual geral de autenticação, sem ecrã de perfil.

## Glossário (rápido) (DERIVADO):

- **Perfil**: dados editáveis do aluno, diferentes da conta de autenticação.
- **Rota protegida**: endpoint que exige sessão válida.
- **`request.user`**: utilizador autenticado anexado pelo guard.
- **Campo opcional**: dado que pode ficar vazio sem bloquear o fluxo.
- **DTO de update**: contrato dos campos que podem ser alterados.
- **Mass assignment**: risco de aceitar campos que o utilizador não devia editar.
- **Estado local**: dados temporários do formulário no React.

## Conceitos teóricos essenciais (DERIVADO):

**Conta vs perfil.** A conta identifica o utilizador para login. O perfil descreve o aluno dentro da app. Separar estes conceitos evita que alterações simples ao perfil mexam em credenciais ou permissões.

**Rota protegida.** Este BK reutiliza `SessionGuard`: sem sessão, a API devolve `401`; com sessão válida, usa `request.user.id` para ler ou atualizar apenas o perfil do próprio aluno.

**Mass assignment.** Se o backend aceitar qualquer campo enviado pelo frontend, um atacante pode tentar alterar `role` ou `userId`. Por isso, o DTO deve aceitar só `name`, `year`, `course` e `className`.

**Validação no backend e frontend.** O frontend ajuda o aluno a corrigir erros rapidamente, mas a segurança está no backend. O backend valida mesmo quando a UI já validou.

## Guia de execução (passo-a-passo) (DERIVADO):

0. **Objetivo (~15 min): confirmar dependência de sessão**
   - Descrição detalhada do objetivo: garantir que o perfil só é acedido por aluno autenticado.
   - Justificação: dados pessoais não podem ser públicos.
   - Como fazer (0.1): rever contrato `GET /api/auth/me`.
   - Como fazer (0.2): decidir que todos os endpoints deste BK usam `SessionGuard`.
   - Ficheiro a rever: `BK-MF0-02`.
   - Ficheiro alvo: `apps/api/src/modules/students/student-profile.controller.ts`.
   - Snippet de referência: `@UseGuards(SessionGuard)`.
   - O que verificar: não existe endpoint público para perfil.

1. **Objetivo (~30 min): modelar StudentProfile**
   - Descrição detalhada do objetivo: criar documento de perfil ligado a `User`.
   - Justificação: mantém conta e perfil separados.
   - Como fazer (1.1): adicionar referência `userId -> User`.
   - Como fazer (1.2): tornar `className` opcional.
   - Ficheiro a rever: `apps/api/src/modules/auth/schemas/user.schema.ts`.
   - Ficheiro alvo: `apps/api/src/modules/students/schemas/student-profile.schema.ts`.
   - Snippet de referência:
     ```ts
     import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
     import { HydratedDocument, Types } from 'mongoose';

     export type StudentProfileDocument = HydratedDocument<StudentProfile>;

     @Schema({ timestamps: true, collection: 'student_profiles' })
     export class StudentProfile {
       @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
       userId!: Types.ObjectId;

       @Prop({ required: true, trim: true })
       name!: string;

       @Prop({ trim: true })
       year?: string;

       @Prop({ trim: true })
       course?: string;

       @Prop({ trim: true })
       className?: string;
     }

     export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);
     ```
   - O que verificar: `className` não é obrigatório.

2. **Objetivo (~25 min): criar DTO de atualização**
   - Descrição detalhada do objetivo: definir apenas campos editáveis.
   - Justificação: evita mass assignment.
   - Como fazer (2.1): criar `UpdateStudentProfileDto`.
   - Como fazer (2.2): rejeitar campos extra, conforme validação escolhida no scaffold.
   - Ficheiro a rever: `docs/RF.md`.
   - Ficheiro alvo: `apps/api/src/modules/students/dto/update-student-profile.dto.ts`.
   - Snippet de referência:
     ```ts
     export type UpdateStudentProfileDto = {
       name?: string;
       year?: string;
       course?: string;
       className?: string | null;
     };
     ```
   - O que verificar: `role`, `email` e `userId` ficam fora do DTO.

3. **Objetivo (~35 min): implementar service de perfil**
   - Descrição detalhada do objetivo: ler e atualizar perfil usando `userId` da sessão.
   - Justificação: o aluno nunca deve escolher o `userId` alvo.
   - Como fazer (3.1): criar `getMyProfile(userId)`.
   - Como fazer (3.2): criar `updateMyProfile(userId, input)`.
   - Ficheiro a rever: `apps/api/src/modules/auth/session.service.ts`.
   - Ficheiro alvo: `apps/api/src/modules/students/student-profile.service.ts`.
   - Snippet de referência:
     ```ts
     export async function updateMyProfile(userId: string, input: UpdateStudentProfileDto) {
       return profileRepository.updateByUserId(userId, input);
     }
     ```
   - O que verificar: o service não recebe `targetUserId` do body.

4. **Objetivo (~30 min): expor endpoints protegidos**
   - Descrição detalhada do objetivo: criar leitura e atualização do perfil.
   - Justificação: o frontend precisa de carregar e guardar os dados.
   - Como fazer (4.1): criar `GET /api/students/me/profile`.
   - Como fazer (4.2): criar `PATCH /api/students/me/profile`.
   - Ficheiro a rever: `MATRIZ-CANONICA-BK.md`.
   - Ficheiro alvo: `apps/api/src/modules/students/student-profile.controller.ts`.
   - Snippet de referência:
     ```ts
     // PATCH /api/students/me/profile
     // body: { name, year, course, className }
     ```
   - O que verificar: sem sessão devolve `401`.

5. **Objetivo (~40 min): criar página de perfil**
   - Descrição detalhada do objetivo: criar formulário claro para editar dados.
   - Justificação: RF03 é funcionalidade visível para o aluno.
   - Como fazer (5.1): criar `ProfilePage`.
   - Como fazer (5.2): incluir estados loading, error, empty e success.
   - Ficheiro a rever: `docs/RNF.md`.
   - Ficheiro alvo: `apps/web/src/pages/student/ProfilePage.tsx`.
   - Snippet de referência:
     ```tsx
     <input name="name" aria-label="Nome" />
     <input name="className" aria-label="Turma (opcional)" />
     ```
   - O que verificar: `turma` aparece como opcional.

6. **Objetivo (~35 min): validar, testar e entregar handoff**
   - Descrição detalhada do objetivo: provar leitura, edição e falhas controladas.
   - Justificação: BK-MF0-04 precisa deste contrato.
   - Como fazer (6.1): testar update válido.
   - Como fazer (6.2): testar sem sessão e tentativa de alterar `role`.
   - Ficheiro a rever: `PLANO-SPRINTS.md`.
   - Ficheiro alvo: `apps/api/src/modules/students/student-profile.spec.ts`.
   - Snippet de referência:
     ```ts
     expect(response.body.role).toBeUndefined();
     ```
   - O que verificar: evidence inclui perfil com `className: null`.

## Checklist de validação (DERIVADO):

- Smoke:
  - Aluno autenticado edita nome e curso.
  - Aluno guarda perfil sem turma.
- Negativos:
  - passo 6; input/ação: pedido sem cookie; resultado esperado: `401`; risco que cobre: exposição de dados pessoais.
  - passo 6; input/ação: body com `role: "ADMIN"`; resultado esperado: campo rejeitado/ignorado; risco que cobre: escalada de privilégios.
- Técnico:
  - `StudentProfile.userId` é único.
  - Controller não recebe `userId` pelo body.
- Regressão das fases anteriores:
  - Login do BK-MF0-02 continua funcional.
- UI/mockup:
  - Sem mockup específico para perfil; usar layout simples e consistente.
- Segurança:
  - Dados de outro utilizador não podem ser lidos por ID manual.

## Critérios de aceite:

- Outputs:
  - Schema Mongoose `StudentProfile`.
  - Endpoints `GET/PATCH /api/students/me/profile`.
  - Página `ProfilePage`.
- Verificações:
  - Update válido responde `200`.
  - Pedido sem sessão responde `401`.
- Qualidade:
  - Campos sensíveis não são editáveis.
  - `turma` é opcional.
- Continuidade:
  - BK-MF0-04 usa este perfil para permitir estudo sem turma.
- Evidência:
  - PR inclui payload válido, negativo sem sessão e negativo de mass assignment.

## Evidence (para o PR/defesa):

- `pr`: `PR #3 - Modelação do Perfil do Aluno com Turma Opcional (BK-MF0-03)`
- `proof`: `Endpoints GET e PATCH /api/students/me/profile modelados com base no Schema Mongoose. Turma definida como opcional para garantir conformidade com o RF04.`
- `neg`: `Validação de rotas protegidas por SessionGuard (401) e bloqueio de mass assignment garantido pela exclusão de role e userId no DTO.`
- `files`: `apps/api/src/modules/students/*`, `apps/web/src/pages/student/ProfilePage.tsx`
- `commands`: `N/A (Scaffold base ainda não injetado no repositório, dependências físicas ausentes)`
- `screenshots`: `N/A`
- `notes`: `A propriedade className foi configurada como opcional no Schema e aceita nulos no DTO, deixando o sistema pronto para o BK-MF0-04 (Estudar sem turma).`

## TODOs

- TODO: confirmar nomes finais dos campos `year`, `course` e `className` no scaffold.
- TODO: decidir se `ano` deve ser texto livre ou lista controlada.
- FOLLOW-UP: BK-MF0-04 deve validar comportamento com `className` vazio.
- Assunção a validar com o orientador: turma é texto opcional até existir módulo de turmas.
- Decisão dependente de mockup: não existe ecrã de perfil no mockup atual.
- Decisão dependente de app/código ainda inexistente: confirmar paths após scaffold.

## Changelog
- `2026-05-24`: guia refinado para perfil protegido, turma opcional e continuidade com estudo individual.
- `2026-05-25`: persistência atualizada para MongoDB/Mongoose com referência `userId`.
