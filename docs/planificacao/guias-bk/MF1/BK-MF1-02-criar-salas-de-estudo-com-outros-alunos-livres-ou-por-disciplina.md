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

## Objetivo
Implementar `RF14`: permitir que alunos criem salas de estudo livres ou associadas a uma disciplina, convidem membros por email e vejam apenas salas onde são membros.

## Importância
Salas de estudo criam contexto colaborativo entre alunos. Tudo o que vem a seguir, como partilhas e IA da sala, depende de uma regra simples: só membros podem ler ou escrever no contexto da sala.

## Scope-in
- Criar `StudyRoom`.
- Associar o criador como primeiro membro.
- Criar sala `FREE` ou `SUBJECT`.
- Validar existência de disciplina quando a sala é `SUBJECT`.
- Adicionar membro por email.
- Listar apenas salas do aluno autenticado.

## Scope-out
- Chat em tempo real.
- Moderação avançada.
- Papéis internos dentro da sala.
- IA da sala, que entra em `BK-MF1-04`.

## Estado antes
- Alunos autenticados existem.
- A aplicação ainda não tem espaços colaborativos persistentes.

## Estado depois
- Aluno cria sala.
- Criador fica em `memberIds`.
- Membro adiciona outro aluno por email.
- Não membro não vê nem manipula a sala.

## Pré-requisitos
- `BK-MF0-02` com `SessionGuard`.
- `BK-MF0-03` com perfil de aluno funcional.
- `BK-MF1-08` pode existir para validar `subjectId`; sala livre não depende dele.

## Glossário
- **Sala livre**: sala sem disciplina associada.
- **Sala por disciplina**: sala ligada a uma disciplina existente.
- **Membro**: aluno autorizado a consultar e escrever na sala.

## Conceitos teóricos
**Sala de estudo.** Uma sala é um espaço partilhado entre alunos. Pode ser livre, para estudar qualquer tema, ou associada a uma disciplina já existente. A associação à disciplina ajuda a organizar o contexto, mas a segurança da sala continua a depender dos membros.

**Membership.** A lista `memberIds` guarda os IDs dos alunos que pertencem à sala. Esta lista vem da base de dados, não do frontend. Sempre que alguém tenta listar, convidar ou mais tarde usar a IA da sala, o backend confirma se `request.user.id` está dentro de `memberIds`.

**Criador como primeiro membro.** Quando a sala é criada, o aluno autenticado entra automaticamente em `memberIds`. Sem isto, o próprio criador criaria uma sala onde não conseguiria entrar.

**Sala por disciplina.** Quando `type` é `SUBJECT`, o frontend envia `subjectId`. Esse ID serve para ligar a sala a uma disciplina existente. O backend valida se a disciplina existe para evitar salas apontadas para contextos inexistentes.

**Convite por email.** Este BK não cria contas novas. O convite procura um utilizador existente com `role: "STUDENT"` e adiciona o seu `_id` a `memberIds`. Isto mantém o fluxo simples e verificável para os BKs seguintes.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

## Arquitetura do BK
- `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
- `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`
- `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`
- `apps/api/src/modules/study-rooms/study-rooms.service.ts`
- `apps/api/src/modules/study-rooms/study-rooms.controller.ts`
- `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- `apps/web/src/lib/api/studyRooms.ts`
- `apps/web/src/pages/student/StudyRoomsPage.tsx`

Endpoints:
- `POST /api/study-rooms`
- `GET /api/study-rooms`
- `POST /api/study-rooms/:roomId/members`

## Guia linear de implementação

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF0-02` com `SessionGuard`.
- `BK-MF0-03` com perfil de aluno funcional.
- `BK-MF1-08` pode existir para validar `subjectId`; sala livre não depende dele.

### Passo 1 - Criar schema da sala

1. Explicação simples do objetivo.

    Neste passo vais criar schema da sala nos ficheiros `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/schemas/study-room.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type StudyRoomDocument = HydratedDocument<StudyRoom>;
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type StudyRoomType = "FREE" | "SUBJECT";

// Comentário pedagógico: @Schema transforma a classe num modelo persistido pelo Mongoose.
@Schema({ timestamps: true, collection: "study_rooms" })
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class StudyRoom {
    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "Subject", index: true })
    subjectId?: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTOs

1. Explicação simples do objetivo.

    Neste passo vais criar dtos nos ficheiros `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`, `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class CreateStudyRoomDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsIn(["FREE", "SUBJECT"])
    type!: "FREE" | "SUBJECT";

    @ValidateIf((body: CreateStudyRoomDto) => body.type === "SUBJECT")
    @IsMongoId()
    subjectId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
```

```ts
// apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { IsEmail } from "class-validator";

// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.service.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { Subject, SubjectDocument } from "../subjects/schemas/subject.schema";
import { AddRoomMemberDto } from "./dto/add-room-member.dto";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoom, StudyRoomDocument } from "./schemas/study-room.schema";

@Injectable()
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class StudyRoomsService {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
    ) {}

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async create(actor: AuthenticatedUser, dto: CreateStudyRoomDto) {
        this.assertStudent(actor);

        const subjectId = await this.resolveSubjectId(dto);
        const room = await this.roomModel.create({
            ownerStudentId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            type: dto.type,
            subjectId,
            description: dto.description?.trim(),
            memberIds: [new Types.ObjectId(actor.id)],
        });

        return this.toView(room);
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async listMine(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const rooms = await this.roomModel
            .find({ memberIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return rooms.map((room) => this.toView(room));
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async addMember(actor: AuthenticatedUser, roomId: string, dto: AddRoomMemberDto) {
        this.assertStudent(actor);
        const room = await this.ensureMember(actor.id, roomId);

        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!student) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const exists = room.memberIds.some((id) => id.equals(studentId));

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!exists) {
            room.memberIds.push(studentId);
            await room.save();
        }

        return this.toView(room);
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async ensureMember(studentId: string, roomId: string) {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!Types.ObjectId.isValid(roomId)) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new NotFoundException("Sala não encontrada.");
        }

        const room = await this.roomModel.findOne({
            _id: new Types.ObjectId(roomId),
            memberIds: new Types.ObjectId(studentId),
        });

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!room) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new ForbiddenException("Só membros podem aceder a esta sala.");
        }

        return room;
    }

    private async resolveSubjectId(dto: CreateStudyRoomDto) {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (dto.type === "FREE") {
            return undefined;
        }

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!dto.subjectId || !Types.ObjectId.isValid(dto.subjectId)) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new BadRequestException("Disciplina inválida.");
        }

        const subject = await this.subjectModel.exists({ _id: new Types.ObjectId(dto.subjectId) });

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (!subject) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new BadRequestException("Disciplina inválida.");
        }

        return new Types.ObjectId(dto.subjectId);
    }

    private assertStudent(actor: AuthenticatedUser) {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (actor.role !== "STUDENT") {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new ForbiddenException("Apenas alunos podem gerir salas de estudo.");
        }
    }

    private toView(room: StudyRoom | StudyRoomDocument) {
        return {
            id: room._id.toString(),
            ownerStudentId: room.ownerStudentId.toString(),
            name: room.name,
            type: room.type,
            subjectId: room.subjectId?.toString() ?? "",
            description: room.description ?? "",
            memberIds: room.memberIds.map((id) => id.toString()),
        };
    }
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.controller.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AddRoomMemberDto } from "./dto/add-room-member.dto";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto";
import { StudyRoomsService } from "./study-rooms.service";

@Controller("api/study-rooms")
@UseGuards(SessionGuard)
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class StudyRoomsController {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() dto: CreateStudyRoomDto) {
        return this.studyRoomsService.create(request.user as AuthenticatedUser, dto);
    }

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.studyRoomsService.listMine(request.user as AuthenticatedUser);
    }

    @Post(":roomId/members")
    addMember(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: AddRoomMemberDto,
    ) {
        return this.studyRoomsService.addMember(request.user as AuthenticatedUser, roomId, dto);
    }
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { Subject, SubjectSchema } from "../subjects/schemas/subject.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: User.name, schema: UserSchema },
            { name: Subject.name, schema: SubjectSchema },
        ]),
    ],
    controllers: [StudyRoomsController],
    providers: [StudyRoomsService],
    exports: [StudyRoomsService, MongooseModule],
})
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class StudyRoomsModule {}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/studyRooms.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/studyRooms.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/studyRooms.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type StudyRoomView = {
    id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    subjectId: string;
    description: string;
    memberIds: string[];
};

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
async function parseResponse<T>(response: Response): Promise<T> {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createStudyRoom(input: {
    name: string;
    type: "FREE" | "SUBJECT";
    subjectId?: string;
    description?: string;
}) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch("/api/study-rooms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<StudyRoomView>(response);
}

export async function listStudyRooms() {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch("/api/study-rooms", {
        credentials: "include",
    });

    return parseResponse<StudyRoomView[]>(response);
}

export async function addRoomMember(roomId: string, email: string) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<StudyRoomView>(response);
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do aluno

1. Explicação simples do objetivo.

    Neste passo vais criar página do aluno nos ficheiros `apps/web/src/pages/student/StudyRoomsPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/StudyRoomsPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/student/StudyRoomsPage.tsx
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { FormEvent, useEffect, useState } from "react";
import {
    StudyRoomView,
    addRoomMember,
    createStudyRoom,
    listStudyRooms,
} from "../../lib/api/studyRooms";

// Comentário pedagógico: esta função isola uma transformação para o service não ficar sobrecarregado.
export function StudyRoomsPage() {
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [rooms, setRooms] = useState<StudyRoomView[]>([]);
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [error, setError] = useState("");

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async function refresh() {
        setRooms(await listStudyRooms());
    }

    // Comentário pedagógico: useEffect carrega dados quando a página abre ou quando um ID muda.
    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, []);

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    // Comentário pedagógico: esta função trata o formulário sem recarregar a página.
    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);

        try {
            await createStudyRoom({
                name: String(form.get("name") ?? ""),
                type: String(form.get("type") ?? "FREE") as "FREE" | "SUBJECT",
                subjectId: String(form.get("subjectId") ?? "") || undefined,
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a sala.");
        }
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    // Comentário pedagógico: esta função trata o formulário sem recarregar a página.
    async function handleInvite(roomId: string, email: string) {
        await addRoomMember(roomId, email);
        await refresh();
    }

    // Comentário pedagógico: o JSX abaixo define o que aparece no browser.
    return (
        <main>
            <h1>Salas de estudo</h1>
            <form onSubmit={handleCreate}>
                <input name="name" placeholder="Nome da sala" required />
                <select name="type">
                    <option value="FREE">Livre</option>
                    <option value="SUBJECT">Disciplina</option>
                </select>
                <input name="subjectId" placeholder="ID da disciplina" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit">Criar sala</button>
            </form>

            {error ? <p role="alert">{error}</p> : null}

            {rooms.map((room) => (
                <article key={room.id}>
                    <h2>{room.name}</h2>
                    <p>{room.type} · {room.memberIds.length} membros</p>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            const form = new FormData(event.currentTarget);
                            handleInvite(room.id, String(form.get("email") ?? "")).catch(
                                (reason: Error) => setError(reason.message),
                            );
                            event.currentTarget.reset();
                        }}
                    >
                        <input name="email" type="email" placeholder="Email do colega" required />
                        <button type="submit">Adicionar</button>
                    </form>
                </article>
            ))}
        </main>
    );
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Validar comportamento

1. Explicação simples do objetivo.

    Neste passo vais validar comportamento no fluxo de validação do BK. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- VALIDAR: este passo não cria ficheiros novos.
- LOCALIZAÇÃO: executa os cenários indicados neste passo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

Não há código novo neste passo. Usa-o para confirmar que os passos anteriores funcionam em conjunto.

5. Explicação do código.

    - Aluno cria sala `FREE`.
- Aluno cria sala `SUBJECT` com disciplina existente.
- Sala `SUBJECT` sem disciplina válida devolve `400`.
- Criador aparece em `memberIds`.
- Membro adiciona outro aluno por email.
- Não membro não consegue adicionar membros.
- Professor recebe `403`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Critérios de aceite
- `StudyRoom` guarda owner, tipo, disciplina opcional e membros.
- Todas as ações usam sessão autenticada.
- `StudyRoomsService.ensureMember` fica exportável para BKs seguintes.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa uma sala com dois alunos e uma tentativa de acesso por terceiro aluno.

## Evidence para PR/defesa
- Screenshot de criação de sala.
- Screenshot de membro adicionado.
- Resposta `403` para não membro.
- Registo com `memberIds`.

## Handoff
`BK-MF1-03` deve reutilizar `StudyRoomsService.ensureMember` antes de criar ou listar partilhas. `BK-MF1-04` deve usar a mesma regra antes de chamar IA.

## Changelog
- 2026-05-30: Guia reescrito com módulo completo, validação de disciplina e membership reutilizável.
