# BK-MF1-02 - Criar salas de estudo com outros alunos (livres ou por disciplina).

## Header
- `doc_id`: `GUIA-BK-MF1-02`
- `bk_id`: `BK-MF1-02`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03`
- `rf_rnf`: `RF14`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-03`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-02-criar-salas-de-estudo-com-outros-alunos-livres-ou-por-disciplina.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF14`: Criar salas de estudo com outros alunos (livres ou por disciplina). Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, regras de permissão, endpoint NestJS e chamada no frontend.

O guia está escrito para ser seguido por alunos: cada bloco de código tem uma finalidade concreta, não depende de funções escondidas e indica como validar o comportamento esperado.

## Porque é que isto é importante
A `MF1` acrescenta colaboração e contexto partilhado ao StudyFlow. A partir daqui, já não basta guardar dados: é preciso provar que cada aluno ou professor só acede ao contexto certo.

Neste BK, a regra mais importante é: a identidade vem da sessão autenticada e o contexto é confirmado no backend. O frontend ajuda a experiência, mas nunca é a autoridade de segurança.

## O que entra (scope)
- Criar salas livres ou associadas a uma disciplina.
- Adicionar o criador como primeiro membro.
- Convidar outro aluno por email.
- Listar apenas salas onde o aluno autenticado é membro.

## O que não entra (scope-out)
- Chat em tempo real.
- Moderação avançada.
- IA da sala, que fica para `BK-MF1-04`.

## Como saber que isto ficou bem
- Aluno cria sala e recebe `201 Created`.
- Criador aparece como membro.
- Membro pode convidar outro aluno.
- Não membro não vê a sala.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-02` (CANONICO)
- Requisito: `RF14` (CANONICO)
- Ator principal: aluno autenticado (DERIVADO)
- Endpoint principal: `POST /api/study-rooms` (DERIVADO)
- Persistência principal: `study_rooms` (DERIVADO)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF0-02` para sessão segura.
- `BK-MF0-03` para papel do utilizador.

## Glossário rápido
- `Ownership`: garantia de que um utilizador só acede ao seu contexto.
- `Membership`: garantia de que um aluno pertence a uma sala ou turma antes de ver dados desse contexto.
- `DTO`: classe que valida o body antes do service.
- `Fonte processável`: conteúdo que pode alimentar IA sem inventar informação.
- `IDOR`: falha em que trocar um ID no pedido permite aceder a dados de outra pessoa.

## Conceitos teóricos essenciais
- Uma sala de estudo é um contexto colaborativo entre alunos.
- O criador deve ser sempre membro; isso evita salas sem responsável.
- Adicionar membro por email exige validar que o utilizador existe e tem papel de aluno.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts
apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts
apps/api/src/modules/study-rooms/services/study-rooms.service.ts
apps/api/src/modules/study-rooms/controllers/study-rooms.controller.ts
apps/api/src/modules/study-rooms/study-rooms.module.ts
apps/web/src/lib/studyRoomsApi.ts
apps/web/src/pages/student/StudyRoomsPage.tsx
```

### Sequência do fluxo
1. Aluno cria sala.
2. Service grava `ownerId` e `memberIds` com o aluno autenticado.
3. Aluno adiciona membro por email.
4. Listagem filtra por `memberIds`.

### Riscos técnicos a controlar
- Aceitar `ownerId` no body.
- Duplicar membros.
- Permitir que um não membro convide pessoas.

## Guia linear de implementação

### Passo 1 - Confirmar contrato e dependências
Confirma o header, o requisito funcional e as dependências. Se uma dependência ainda não existir no projeto real, implementa-a primeiro ou mantém o BK bloqueado; não inventes um atalho no endpoint.

Validação deste passo:
- O endpoint usa o ator correto: aluno em `/api/study-rooms` ou `/api/student`, professor em `/api/teacher`.
- O service sabe verificar ownership ou membership no backend.
- Não há campos de identidade confiável no body.

### Passo 2 - Criar modelo e DTO
```ts
// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudyRoomDocument = HydratedDocument<StudyRoom>;

@Schema({ timestamps: true, collection: 'study_rooms' })
export class StudyRoom {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  memberIds!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Subject', default: null })
  subjectId?: Types.ObjectId | null;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ enum: ['FREE', 'SUBJECT'], default: 'FREE' })
  type!: 'FREE' | 'SUBJECT';
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });

// apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts
import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateStudyRoomDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEnum(['FREE', 'SUBJECT'])
  type!: 'FREE' | 'SUBJECT';

  @ValidateIf((dto: CreateStudyRoomDto) => dto.type === 'SUBJECT')
  @IsMongoId()
  subjectId?: string;
}

// apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts
import { IsEmail } from 'class-validator';

export class AddRoomMemberDto {
  @IsEmail()
  email!: string;
}
```

Explicação do código:
- O schema guarda o mínimo necessário para o requisito.
- Os índices acompanham as queries que o service vai executar.
- O DTO valida forma e tamanho antes de chegar à base de dados.
- IDs de dono, autor ou aluno autenticado são derivados da sessão.

### Passo 3 - Criar service completo
```ts
// apps/api/src/modules/study-rooms/services/study-rooms.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { AddRoomMemberDto } from '../dto/add-room-member.dto';
import { CreateStudyRoomDto } from '../dto/create-study-room.dto';
import { StudyRoom, StudyRoomDocument } from '../schemas/study-room.schema';

@Injectable()
export class StudyRoomsService {
  constructor(
    @InjectModel(StudyRoom.name) private readonly roomModel: Model<StudyRoomDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(actor: AuthenticatedUser, dto: CreateStudyRoomDto) {
    this.assertStudent(actor);
    const actorId = new Types.ObjectId(actor.id);
    const room = await this.roomModel.create({ ownerId: actorId, memberIds: [actorId], subjectId: dto.type === 'SUBJECT' ? new Types.ObjectId(dto.subjectId) : null, name: dto.name.trim(), type: dto.type });
    return this.toView(room);
  }

  async addMember(actor: AuthenticatedUser, roomId: string, dto: AddRoomMemberDto) {
    this.assertStudent(actor);
    const room = await this.findRoomForMember(actor.id, roomId);
    const user = await this.userModel.findOne({ email: dto.email.trim().toLowerCase(), role: 'STUDENT' });
    if (!user) throw new NotFoundException('Aluno não encontrado.');
    const memberId = user._id as Types.ObjectId;
    if (!room.memberIds.some((id) => id.equals(memberId))) {
      room.memberIds.push(memberId);
      await room.save();
    }
    return this.toView(room);
  }

  async listMine(actor: AuthenticatedUser) {
    this.assertStudent(actor);
    const rooms = await this.roomModel.find({ memberIds: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
    return rooms.map((room) => this.toView(room));
  }

  private async findRoomForMember(userId: string, roomId: string) {
    const room = await this.roomModel.findOne({ _id: new Types.ObjectId(roomId), memberIds: new Types.ObjectId(userId) });
    if (!room) throw new NotFoundException('Sala não encontrada para este aluno.');
    return room;
  }

  private assertStudent(actor: AuthenticatedUser) {
    if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos podem gerir salas de estudo.');
  }

  private toView(room: StudyRoomDocument | StudyRoom & { _id: Types.ObjectId }) {
    return { id: room._id.toString(), name: room.name, type: room.type, subjectId: room.subjectId?.toString() ?? null, memberCount: room.memberIds.length };
  }
}
```

Explicação do código:
- A autorização acontece antes da leitura ou escrita principal.
- A query de contexto usa membership ou ownership, não apenas `_id`.
- Não há métodos por implementar fora do ficheiro mostrado.
- As exceções devolvem estados previsíveis para a UI e para os testes.

### Passo 4 - Criar controller e módulo
```ts
// apps/api/src/modules/study-rooms/controllers/study-rooms.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AddRoomMemberDto } from '../dto/add-room-member.dto';
import { CreateStudyRoomDto } from '../dto/create-study-room.dto';
import { StudyRoomsService } from '../services/study-rooms.service';

@UseGuards(SessionGuard)
@Controller('api/study-rooms')
export class StudyRoomsController {
  constructor(private readonly service: StudyRoomsService) {}
  @Post() create(@Req() request: Request, @Body() dto: CreateStudyRoomDto) { return this.service.create(request.user, dto); }
  @Post(':roomId/members') addMember(@Req() request: Request, @Param('roomId') roomId: string, @Body() dto: AddRoomMemberDto) { return this.service.addMember(request.user, roomId, dto); }
  @Get() listMine(@Req() request: Request) { return this.service.listMine(request.user); }
}

// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StudyRoom, StudyRoomSchema } from './schemas/study-room.schema';
@Module({ imports: [MongooseModule.forFeature([{ name: StudyRoom.name, schema: StudyRoomSchema }, { name: User.name, schema: UserSchema }])], controllers: [StudyRoomsController], providers: [StudyRoomsService], exports: [StudyRoomsService] })
export class StudyRoomsModule {}
```

Explicação do código:
- `SessionGuard` garante sessão válida.
- `request.user` é a identidade confiável.
- `@Param` identifica o contexto, mas só o service decide se o ator pode usá-lo.
- O módulo regista os schemas necessários ao service.

### Passo 5 - Criar cliente frontend
```tsx
// apps/web/src/lib/studyRoomsApi.ts
export type CreateStudyRoomPayload = { name: string; type: 'FREE' | 'SUBJECT'; subjectId?: string };
export type StudyRoomView = { id: string; name: string; type: 'FREE' | 'SUBJECT'; subjectId: string | null; memberCount: number };
export async function createStudyRoom(payload: CreateStudyRoomPayload): Promise<StudyRoomView> {
  const response = await fetch('/api/study-rooms', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Não foi possível criar a sala.');
  return response.json() as Promise<StudyRoomView>;
}
```

Explicação do código:
- A chamada usa `credentials: 'include'` para enviar o cookie HttpOnly.
- O payload tem tipo explícito.
- A UI mostra erro seguro, sem revelar stack trace.
- O backend continua a validar tudo, mesmo que o frontend bloqueie campos vazios.

### Passo 6 - Validar caminho principal e negativos
Caminho principal:
- `POST /api/study-rooms` cria sala com `memberCount: 1`.
- `GET /api/study-rooms` lista apenas salas onde o aluno é membro.

Cenários negativos:
- Professor recebe `403 Forbidden`.
- Não membro tenta adicionar pessoa e recebe `404 Not Found`.
- Email inexistente recebe `404 Not Found`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

## Evidência de conclusão
- Resposta da criação.
- Resposta após adicionar membro.
- Teste com dois alunos diferentes.

## Handoff para o próximo BK
- `BK-MF1-03` usa `StudyRoom.memberIds` para autorizar partilhas.
- `BK-MF1-04` usa a mesma membership para IA da sala.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código do BK completo nos ficheiros indicados.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos documentados com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
