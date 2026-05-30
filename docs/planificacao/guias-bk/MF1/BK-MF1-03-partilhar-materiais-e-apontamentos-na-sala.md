# BK-MF1-03 - Partilhar materiais e apontamentos na sala.

## Header
- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF15`: permitir que membros de uma sala partilhem apontamentos, URLs e referências de material dentro da sala.

## Importância
A partilha é a fonte colaborativa para a IA da sala. O sistema precisa de guardar quem partilhou, em que sala, e que conteúdo pode ser usado como fonte textual.

## Scope-in
- Criar `RoomShare`.
- Permitir tipos `NOTE`, `URL` e `MATERIAL_REF`.
- Validar que o autor é membro da sala.
- Listar partilhas apenas para membros.
- Expor partilhas textuais para `BK-MF1-04`.

## Scope-out
- Upload de ficheiros.
- Extração automática de páginas externas.
- Edição e remoção de partilhas.
- IA da sala.

## Estado antes
- `BK-MF1-02` criou salas e membership.
- Ainda não existem conteúdos partilhados.

## Estado depois
- Membro cria partilha.
- Membro lista partilhas.
- Não membro recebe erro.
- Partilhas textuais ficam identificadas para IA.

## Pré-requisitos
- `StudyRoomsModule` exporta `StudyRoomsService`.
- `SessionGuard`.
- Validação global de DTOs.

## Glossário
- **Partilha**: conteúdo colocado numa sala por um membro.
- **NOTE**: apontamento textual escrito diretamente.
- **URL**: ligação guardada como referência.
- **MATERIAL_REF**: referência a material já existente.

## Conceitos teóricos
Nem toda a partilha é fonte para IA. Uma URL sem texto extraído é uma referência, não uma fonte factual. Por isso, `usableByAi` deve ser verdadeiro apenas quando existe texto guardado e validado.

## Arquitetura do BK
- `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`
- `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`
- `apps/api/src/modules/study-rooms/room-shares.service.ts`
- `apps/api/src/modules/study-rooms/room-shares.controller.ts`
- `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- `apps/web/src/lib/api/roomShares.ts`
- `apps/web/src/pages/student/RoomSharesPage.tsx`

Endpoints:
- `POST /api/study-rooms/:roomId/shares`
- `GET /api/study-rooms/:roomId/shares`

## Guia linear de implementação

### Passo 1 - Criar schema da partilha

```ts
// apps/api/src/modules/study-rooms/schemas/room-share.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoomShareDocument = HydratedDocument<RoomShare>;
export type RoomShareType = "NOTE" | "URL" | "MATERIAL_REF";

@Schema({ timestamps: true, collection: "room_shares" })
export class RoomShare {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTE", "URL", "MATERIAL_REF"] })
    type!: RoomShareType;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 12000 })
    textContent?: string;

    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    @Prop({ type: Types.ObjectId, ref: "Material" })
    materialId?: Types.ObjectId;

    @Prop({ required: true, default: false })
    usableByAi!: boolean;
}

export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
RoomShareSchema.index({ roomId: 1, usableByAi: 1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts
import {
    IsIn,
    IsMongoId,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateRoomShareDto {
    @IsIn(["NOTE", "URL", "MATERIAL_REF"])
    type!: "NOTE" | "URL" | "MATERIAL_REF";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "NOTE")
    @IsString()
    @MinLength(10)
    @MaxLength(12000)
    textContent?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "MATERIAL_REF")
    @IsMongoId()
    materialId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(12000)
    copiedText?: string;
}
```

### Passo 3 - Criar service

```ts
// apps/api/src/modules/study-rooms/room-shares.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
export class RoomSharesService {
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    async create(actor: AuthenticatedUser, roomId: string, dto: CreateRoomShareDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const textContent = dto.type === "NOTE" ? dto.textContent?.trim() : dto.copiedText?.trim();
        const usableByAi = Boolean(textContent && textContent.length >= 10);

        const share = await this.shareModel.create({
            roomId: room._id,
            authorStudentId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            textContent,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            materialId: dto.materialId ? new Types.ObjectId(dto.materialId) : undefined,
            usableByAi,
        });

        return this.toView(share);
    }

    async list(actor: AuthenticatedUser, roomId: string) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);

        const shares = await this.shareModel
            .find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .lean();

        return shares.map((share) => this.toView(share));
    }

    async findUsableSharesForRoom(roomId: string, sourceIds: string[] = []) {
        const filter: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
        };

        if (sourceIds.length > 0) {
            filter._id = { $in: sourceIds.map((id) => new Types.ObjectId(id)) };
        }

        return this.shareModel.find(filter).sort({ createdAt: -1 });
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem partilhar na sala.");
        }
    }

    private toView(share: RoomShare | RoomShareDocument) {
        return {
            id: share._id.toString(),
            roomId: share.roomId.toString(),
            authorStudentId: share.authorStudentId.toString(),
            type: share.type,
            title: share.title,
            textContent: share.textContent ?? "",
            sourceUrl: share.sourceUrl ?? "",
            materialId: share.materialId?.toString() ?? "",
            usableByAi: share.usableByAi,
        };
    }
}
```

### Passo 4 - Criar controller

```ts
// apps/api/src/modules/study-rooms/room-shares.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomSharesService } from "./room-shares.service";

@Controller("api/study-rooms/:roomId/shares")
@UseGuards(SessionGuard)
export class RoomSharesController {
    constructor(private readonly roomSharesService: RoomSharesService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: CreateRoomShareDto,
    ) {
        return this.roomSharesService.create(request.user as AuthenticatedUser, roomId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("roomId") roomId: string) {
        return this.roomSharesService.list(request.user as AuthenticatedUser, roomId);
    }
}
```

### Passo 5 - Atualizar módulo da sala

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { Subject, SubjectSchema } from "../subjects/schemas/subject.schema";
import { RoomSharesController } from "./room-shares.controller";
import { RoomSharesService } from "./room-shares.service";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: User.name, schema: UserSchema },
            { name: Subject.name, schema: SubjectSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController],
    providers: [StudyRoomsService, RoomSharesService],
    exports: [StudyRoomsService, RoomSharesService, MongooseModule],
})
export class StudyRoomsModule {}
```

### Passo 6 - Criar cliente frontend

```ts
// apps/web/src/lib/api/roomShares.ts
export type RoomShareView = {
    id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent: string;
    sourceUrl: string;
    materialId: string;
    usableByAi: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createRoomShare(
    roomId: string,
    input: {
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        sourceUrl?: string;
        materialId?: string;
        copiedText?: string;
    },
) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<RoomShareView>(response);
}

export async function listRoomShares(roomId: string) {
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        credentials: "include",
    });

    return parseResponse<RoomShareView[]>(response);
}
```

### Passo 7 - Criar página da sala

```tsx
// apps/web/src/pages/student/RoomSharesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { RoomShareView, createRoomShare, listRoomShares } from "../../lib/api/roomShares";

type Props = {
    roomId: string;
};

export function RoomSharesPage({ roomId }: Props) {
    const [shares, setShares] = useState<RoomShareView[]>([]);
    const [error, setError] = useState("");

    async function refresh() {
        setShares(await listRoomShares(roomId));
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, [roomId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            await createRoomShare(roomId, {
                type: String(form.get("type") ?? "NOTE") as "NOTE" | "URL" | "MATERIAL_REF",
                title: String(form.get("title") ?? ""),
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
                materialId: String(form.get("materialId") ?? ""),
                copiedText: String(form.get("copiedText") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível partilhar.");
        }
    }

    return (
        <main>
            <h1>Partilhas da sala</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTE">Apontamento</option>
                    <option value="URL">URL</option>
                    <option value="MATERIAL_REF">Material</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="textContent" placeholder="Texto do apontamento" />
                <input name="sourceUrl" type="url" placeholder="URL" />
                <input name="materialId" placeholder="ID do material" />
                <textarea name="copiedText" placeholder="Texto copiado para a IA" />
                <button type="submit">Partilhar</button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {shares.map((share) => (
                <article key={share.id}>
                    <h2>{share.title}</h2>
                    <p>{share.type} · {share.usableByAi ? "Fonte de IA" : "Referência"}</p>
                </article>
            ))}
        </main>
    );
}
```

### Passo 8 - Validar comportamento
- Membro cria `NOTE` com texto e `usableByAi` fica verdadeiro.
- Membro cria `URL` e `usableByAi` fica falso sem texto copiado.
- Não membro recebe `403`.
- Professor recebe `403`.
- Listagem só funciona para membros.
- `RoomSharesService.findUsableSharesForRoom` devolve apenas fontes textuais.

## Critérios de aceite
- `RoomShare` guarda autor, sala, tipo e conteúdo.
- Membership é validada antes de criar e listar.
- Partilhas sem texto não alimentam IA.
- `StudyRoomsModule` exporta `RoomSharesService`.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Inclui teste com terceiro aluno fora da sala.

## Evidence para PR/defesa
- Screenshot de apontamento partilhado.
- Screenshot de URL como referência.
- Resposta `403` para não membro.
- Lista de fontes elegíveis para IA.

## Handoff
`BK-MF1-04` deve usar `RoomSharesService.findUsableSharesForRoom` e bloquear a IA se a sala não tiver fontes textuais.

## Changelog
- 2026-05-30: Guia reescrito com schema completo, módulo atualizado e fontes textuais explícitas.
