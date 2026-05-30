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
O `memberIds` é a fronteira de autorização da sala. O service deve consultar esta lista antes de qualquer ação. A validação de disciplina existe para evitar referências quebradas, mas a sala continua a ser um espaço entre alunos.

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

### Passo 1 - Criar schema da sala

```ts
// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoomDocument = HydratedDocument<StudyRoom>;
export type StudyRoomType = "FREE" | "SUBJECT";

@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    @Prop({ type: Types.ObjectId, ref: "Subject", index: true })
    subjectId?: Types.ObjectId;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
```

### Passo 2 - Criar DTOs

```ts
// apps/api/src/modules/study-rooms/dto/create-study-room.dto.ts
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";

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
import { IsEmail } from "class-validator";

export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}
```

### Passo 3 - Criar service

```ts
// apps/api/src/modules/study-rooms/study-rooms.service.ts
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
export class StudyRoomsService {
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
    ) {}

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

    async listMine(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const rooms = await this.roomModel
            .find({ memberIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return rooms.map((room) => this.toView(room));
    }

    async addMember(actor: AuthenticatedUser, roomId: string, dto: AddRoomMemberDto) {
        this.assertStudent(actor);
        const room = await this.ensureMember(actor.id, roomId);

        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        if (!student) {
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const exists = room.memberIds.some((id) => id.equals(studentId));

        if (!exists) {
            room.memberIds.push(studentId);
            await room.save();
        }

        return this.toView(room);
    }

    async ensureMember(studentId: string, roomId: string) {
        if (!Types.ObjectId.isValid(roomId)) {
            throw new NotFoundException("Sala não encontrada.");
        }

        const room = await this.roomModel.findOne({
            _id: new Types.ObjectId(roomId),
            memberIds: new Types.ObjectId(studentId),
        });

        if (!room) {
            throw new ForbiddenException("Só membros podem aceder a esta sala.");
        }

        return room;
    }

    private async resolveSubjectId(dto: CreateStudyRoomDto) {
        if (dto.type === "FREE") {
            return undefined;
        }

        if (!dto.subjectId || !Types.ObjectId.isValid(dto.subjectId)) {
            throw new BadRequestException("Disciplina inválida.");
        }

        const subject = await this.subjectModel.exists({ _id: new Types.ObjectId(dto.subjectId) });

        if (!subject) {
            throw new BadRequestException("Disciplina inválida.");
        }

        return new Types.ObjectId(dto.subjectId);
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
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

### Passo 4 - Criar controller

```ts
// apps/api/src/modules/study-rooms/study-rooms.controller.ts
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
export class StudyRoomsController {
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

### Passo 5 - Criar módulo

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
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
export class StudyRoomsModule {}
```

### Passo 6 - Criar cliente frontend

```ts
// apps/web/src/lib/api/studyRooms.ts
export type StudyRoomView = {
    id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    subjectId: string;
    description: string;
    memberIds: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
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
    const response = await fetch("/api/study-rooms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<StudyRoomView>(response);
}

export async function listStudyRooms() {
    const response = await fetch("/api/study-rooms", {
        credentials: "include",
    });

    return parseResponse<StudyRoomView[]>(response);
}

export async function addRoomMember(roomId: string, email: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<StudyRoomView>(response);
}
```

### Passo 7 - Criar página do aluno

```tsx
// apps/web/src/pages/student/StudyRoomsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    StudyRoomView,
    addRoomMember,
    createStudyRoom,
    listStudyRooms,
} from "../../lib/api/studyRooms";

export function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoomView[]>([]);
    const [error, setError] = useState("");

    async function refresh() {
        setRooms(await listStudyRooms());
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, []);

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

    async function handleInvite(roomId: string, email: string) {
        await addRoomMember(roomId, email);
        await refresh();
    }

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

### Passo 8 - Validar comportamento
- Aluno cria sala `FREE`.
- Aluno cria sala `SUBJECT` com disciplina existente.
- Sala `SUBJECT` sem disciplina válida devolve `400`.
- Criador aparece em `memberIds`.
- Membro adiciona outro aluno por email.
- Não membro não consegue adicionar membros.
- Professor recebe `403`.

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
