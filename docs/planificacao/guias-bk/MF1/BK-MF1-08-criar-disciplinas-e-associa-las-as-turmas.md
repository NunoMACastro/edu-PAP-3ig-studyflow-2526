# BK-MF1-08 - Criar disciplinas e associá-las às turmas.

## Header
- `doc_id`: `GUIA-BK-MF1-08`
- `bk_id`: `BK-MF1-08`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-09`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF20`: Criar disciplinas e associá-las às turmas. O objetivo é guiar a implementação completa deste requisito, desde o contrato de dados até ao endpoint protegido e à chamada no frontend.

No final, deves conseguir responder a quatro perguntas sem consultar outro ficheiro: que dados são guardados, quem pode executar a ação, que validações acontecem no backend e que resultado a aplicação mostra ao utilizador.

## Porque é que isto é importante
A `MF1` introduz colaboração, turmas, disciplinas e IA contextual. Isso significa que a aplicação deixa de trabalhar apenas com dados privados de um aluno e passa a cruzar dados de alunos, professores, salas e turmas.

Por isso, a prioridade deste BK é dupla: implementar a funcionalidade pedida e manter fronteiras de segurança claras. Em cada endpoint, a identidade confiável vem da sessão autenticada e nunca de campos enviados livremente pelo frontend.

## O que entra (scope)
- Criar disciplinas oficiais dentro de uma turma.
- Confirmar que a turma pertence ao professor autenticado.
- Listar disciplinas da turma.
- Preparar materiais oficiais, voz docente e IA limitada.

## O que não entra (scope-out)
- Catálogo global de disciplinas.
- Horários ou avaliações.
- Vários professores por disciplina.

## Como saber que isto ficou bem
- Professor dono da turma cria disciplina.
- Professor de outra turma recebe `404 Not Found`.
- Nome duplicado na mesma turma recebe `409 Conflict`.
- Aluno recebe `403 Forbidden`.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-08` (CANONICO)
- Requisito: `RF20` (CANONICO)
- Ator principal: professor autenticado (DERIVADO a partir do requisito)
- Endpoint principal: `POST /api/teacher/classes/:classId/subjects` (DERIVADO a partir da implementação)
- Persistência principal: `subjects` (DERIVADO a partir do modelo)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF1-07` concluído.

## Glossário rápido
- `Ownership`: regra que garante que cada utilizador só acede ao seu próprio contexto.
- `DTO`: classe que valida a entrada HTTP antes da regra de negócio.
- `Service`: camada onde ficam validações de papel, permissões, ownership e persistência.
- `Controller`: camada HTTP; recebe sessão, body e parâmetros, mas não decide regras de negócio.
- `IDOR`: falha de segurança em que alguém acede a dados de outro utilizador mudando um ID no pedido.

## Conceitos teóricos essenciais
- Uma disciplina oficial pertence sempre a uma turma concreta.
- A query de autorização valida turma e professor em conjunto.
- O `subjectId` será usado por materiais oficiais, voz docente e IA da disciplina.

## Arquitetura final deste BK
A implementação assume a stack definida para o StudyFlow: NestJS no backend, MongoDB/Mongoose para persistência, React/TypeScript no frontend e autenticação por sessão com cookie HttpOnly.

### Ficheiros a criar ou editar
```text
apps/api/src/modules/subjects/schemas/subject.schema.ts
apps/api/src/modules/subjects/dto/create-subject.dto.ts
apps/api/src/modules/subjects/services/subjects.service.ts
apps/api/src/modules/subjects/controllers/subjects.controller.ts
apps/api/src/modules/subjects/subjects.module.ts
apps/web/src/lib/subjectsApi.ts
apps/web/src/pages/teacher/ClassSubjectsPage.tsx
```

### Sequência do fluxo
1. Professor abre uma turma sua.
2. Frontend envia nome e descrição.
3. Service confirma ownership da turma.
4. Disciplina é criada com `classId` e `teacherId` autorizados.

### Erros que este BK deve evitar
- Criar disciplina em turma de outro professor.
- Duplicar nome na mesma turma.
- Receber `teacherId` no body.

## Guia linear de implementação

### Passo 1 - Confirmar contrato e dependências
Antes de escrever código, confirma o header deste BK e relê o requisito funcional. Se encontrares divergência entre documentos, regista-a no relatório de auditoria em vez de alterar silenciosamente `bk_id`, `rf_rnf`, `owner`, prioridade ou sprint.

Validação deste passo:
- O requisito no header continua alinhado com `docs/RF.md`.
- As dependências diretas estão concluídas ou explicitamente assumidas como pré-requisito.
- O endpoint escolhido não quebra a organização por ator: `/api/student/...` para aluno e `/api/teacher/...` para professor.

Erro comum: começar por criar a página React e só depois descobrir que o backend não sabe quem tem permissão. Neste tipo de funcionalidade, a regra de autorização vem primeiro.

### Passo 2 - Criar modelo e DTO
O modelo define a forma do dado persistido. O DTO define o que o cliente pode enviar. Campos como `userId`, `teacherId`, `ownerId`, `studentId` ou `authorId` não aparecem no DTO quando podem ser obtidos pela sessão.

```ts
// apps/api/src/modules/subjects/schemas/subject.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type SubjectDocument = HydratedDocument<Subject>;
@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ type: Types.ObjectId, ref: 'SchoolClass', required: true, index: true }) classId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) teacherId!: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 120 }) name!: string;
  @Prop({ trim: true, maxlength: 400, default: '' }) description!: string;
}
export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true });

// apps/api/src/modules/subjects/dto/create-subject.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateSubjectDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(400) description?: string;
}
```

Explicação do código:
- O schema inclui índices para as queries usadas pelo service.
- O DTO limita tamanho, formato e valores permitidos.
- A identidade do ator fica fora do body para evitar mass assignment.
- O nome dos ficheiros indica claramente o contexto funcional do BK.

Validação deste passo:
- Payload incompleto devolve `400 Bad Request`.
- IDs inválidos devolvem `400 Bad Request` antes de executar a regra de negócio.
- Campos extra não devem ser usados para determinar ownership.

### Passo 3 - Criar service completo
O service abaixo é a peça central do BK. Ele contém as validações de papel, ownership, contexto, estados inválidos e normalização dos dados guardados.

```ts
// apps/api/src/modules/subjects/services/subjects.service.ts
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { SchoolClass, SchoolClassDocument } from '../../classes/schemas/school-class.schema';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Subject, SubjectDocument } from '../schemas/subject.schema';
@Injectable()
export class SubjectsService {
  constructor(@InjectModel(Subject.name) private readonly subjectModel: Model<SubjectDocument>, @InjectModel(SchoolClass.name) private readonly classModel: Model<SchoolClassDocument>) {}
  async create(actor: AuthenticatedUser, classId: string, dto: CreateSubjectDto) {
    this.assertTeacher(actor);
    const schoolClass = await this.findOwnedClass(actor.id, classId);
    const name = dto.name.trim();
    if (await this.subjectModel.exists({ classId: schoolClass._id, name })) throw new ConflictException('Já existe uma disciplina com esse nome nesta turma.');
    const created = await this.subjectModel.create({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id), name, description: dto.description?.trim() || '' });
    return this.toView(created);
  }
  async list(actor: AuthenticatedUser, classId: string) {
    this.assertTeacher(actor);
    const schoolClass = await this.findOwnedClass(actor.id, classId);
    const subjects = await this.subjectModel.find({ classId: schoolClass._id }).sort({ name: 1 }).lean();
    return subjects.map((subject) => this.toView(subject));
  }
  private async findOwnedClass(teacherId: string, classId: string) {
    const schoolClass = await this.classModel.findOne({ _id: new Types.ObjectId(classId), teacherId: new Types.ObjectId(teacherId) });
    if (!schoolClass) throw new NotFoundException('Turma não encontrada para este professor.');
    return schoolClass;
  }
  private assertTeacher(actor: AuthenticatedUser) { if (actor.role !== 'TEACHER') throw new ForbiddenException('Apenas professores podem gerir disciplinas.'); }
  private toView(subject: SubjectDocument | Subject & { _id: Types.ObjectId }) { return { id: subject._id.toString(), classId: subject.classId.toString(), name: subject.name, description: subject.description }; }
}
```

Explicação do código:
- A primeira decisão é sempre validar o papel do ator.
- As queries sensíveis incluem o contexto autorizado, não apenas `_id`.
- As exceções têm mensagens controladas e não revelam detalhes internos.
- A resposta final é uma view simples, adequada ao frontend.

Validação deste passo:
- Ator sem permissão recebe `403 Forbidden`.
- Recurso fora do contexto do ator recebe `404 Not Found` ou `403 Forbidden`, conforme a regra do BK.
- Caminho principal devolve a view esperada.

### Passo 4 - Criar controller e módulo
O controller protege a rota com sessão, recebe parâmetros e body, e delega a regra de negócio no service. O módulo regista todos os schemas necessários para o service funcionar.

```ts
// apps/api/src/modules/subjects/controllers/subjects.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectsService } from '../services/subjects.service';
@UseGuards(SessionGuard)
@Controller('api/teacher/classes/:classId/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}
  @Post() create(@Req() request: Request, @Param('classId') classId: string, @Body() dto: CreateSubjectDto) { return this.subjectsService.create(request.user, classId, dto); }
  @Get() list(@Req() request: Request, @Param('classId') classId: string) { return this.subjectsService.list(request.user, classId); }
}

// apps/api/src/modules/subjects/subjects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolClass, SchoolClassSchema } from '../classes/schemas/school-class.schema';
import { SubjectsController } from './controllers/subjects.controller';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { SubjectsService } from './services/subjects.service';
@Module({ imports: [MongooseModule.forFeature([{ name: SchoolClass.name, schema: SchoolClassSchema }, { name: Subject.name, schema: SubjectSchema }])], controllers: [SubjectsController], providers: [SubjectsService], exports: [SubjectsService] })
export class SubjectsModule {}
```

Explicação do código:
- `SessionGuard` impede chamadas anónimas.
- `request.user` é a fonte confiável de identidade.
- `@Param` identifica o contexto técnico, mas o service confirma se esse contexto pertence ao ator.
- O módulo torna explícitas as dependências de persistência usadas neste BK.

Validação deste passo:
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido autenticado chama o método certo do service.
- O controller não contém regras de ownership duplicadas.

### Passo 5 - Criar cliente frontend
O frontend chama o endpoint com `credentials: 'include'` para enviar o cookie HttpOnly. A UI deve mostrar loading, erro e sucesso, mas a segurança principal continua sempre no backend.

```tsx
// apps/web/src/lib/subjectsApi.ts
export type CreateSubjectPayload = { name: string; description?: string };
export type SubjectView = { id: string; classId: string; name: string; description: string };
export async function createSubject(classId: string, payload: CreateSubjectPayload): Promise<SubjectView> {
  const response = await fetch(`/api/teacher/classes/${classId}/subjects`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Não foi possível criar a disciplina.');
  return response.json() as Promise<SubjectView>;
}
```

Explicação do código:
- O payload tem tipo próprio; não há chamadas com `unknown`.
- O cookie de sessão é enviado sem expor tokens ao JavaScript.
- O formulário impede submissões óbvias incompletas, mas o backend continua a validar tudo.
- A mensagem de erro é curta e segura para o utilizador final.

Validação deste passo:
- O botão fica bloqueado quando faltam dados mínimos.
- Uma resposta de sucesso atualiza a página sem refresh manual.
- Uma resposta de erro mostra feedback sem expor stack trace.

### Passo 6 - Validar caminho principal e negativos
Caminho principal esperado:
- `POST` com turma própria devolve disciplina criada.
- `GET` devolve disciplinas da turma.

Cenários negativos obrigatórios:
- Turma de outro professor devolve `404`.
- Aluno recebe `403`.
- Nome duplicado recebe `409`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

Se algum comando falhar por infraestrutura, regista o erro exato. Não escrevas que está validado se o comando não correu.

### Passo 7 - Revisão de segurança e privacidade
Antes de fechar, confirma:
- O backend ignora IDs de utilizador recebidos no body.
- Todas as queries com dados de utilizador filtram pelo contexto autorizado.
- Dados de aluno, professor, turma, disciplina ou sala não aparecem fora do contexto correto.
- Quando existe IA, a resposta fica limitada às fontes permitidas.
- Erros são claros para o utilizador, mas não revelam detalhes internos.

## Evidência de conclusão
- Resposta HTTP da criação.
- Listagem filtrada pela turma.
- Registo dos negativos.

## Handoff para o próximo BK
- `BK-MF1-09` usa `Subject.teacherId` para validar materiais.
- `BK-MF1-10` usa o mesmo ownership para voz docente.

## Checklist final
- [ ] Header preservado sem alterações a campos canónicos.
- [ ] Modelo, DTO, service, controller/módulo e frontend descritos com código completo para este BK.
- [ ] Código sem helpers por implementar, `any` desnecessário ou payloads sem tipo.
- [ ] Caminho principal e cenários negativos têm expected results concretos.
- [ ] Validação documental executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com implementação fechada por BK, explicação didática e validação objetiva.
