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
**Partilha dentro da sala.** Uma partilha é qualquer conteúdo que um membro coloca no espaço comum: apontamento escrito, URL ou referência a material. A partilha pertence à sala através de `roomId` e pertence ao aluno através de `authorStudentId`.

**Diferença entre referência e fonte.** Uma URL guardada não significa que o sistema leu a página. Enquanto não houver texto copiado ou extraído, a URL é apenas referência visual. A IA só pode usar texto que está guardado em `textContent`.

**`usableByAi`.** Este booleano indica se a partilha tem texto suficiente para alimentar a IA da sala. Ele é calculado no backend a partir de `textContent` ou `copiedText`; o frontend não decide sozinho se uma partilha é segura para IA.

**`copiedText`.** Este campo permite ao aluno colar um excerto textual quando partilha uma URL ou referência. O texto copiado fica em `textContent` e pode tornar a partilha elegível para IA, desde que passe a validação mínima.

**Membership antes de conteúdo.** Antes de criar ou listar partilhas, o service chama `StudyRoomsService.ensureMember`. Isto impede que um aluno coloque conteúdo numa sala onde não participa.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

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

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `StudyRoomsModule` exporta `StudyRoomsService`.
- `SessionGuard`.
- Validação global de DTOs.

### Passo 1 - Criar schema da partilha

1. Explicação simples do objetivo.

    Neste passo vais criar schema da partilha nos ficheiros `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/schemas/room-share.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/schemas/room-share.schema.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type RoomShareDocument = HydratedDocument<RoomShare>;
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type RoomShareType = "NOTE" | "URL" | "MATERIAL_REF";

// Comentário pedagógico: @Schema transforma a classe num modelo persistido pelo Mongoose.
@Schema({ timestamps: true, collection: "room_shares" })
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomShare {
    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    authorStudentId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, enum: ["NOTE", "URL", "MATERIAL_REF"] })
    type!: RoomShareType;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ trim: true, maxlength: 12000 })
    textContent?: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "Material" })
    materialId?: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, default: false })
    usableByAi!: boolean;
}

export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
RoomShareSchema.index({ roomId: 1, usableByAi: 1 });
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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

// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/study-rooms/room-shares.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-shares.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-shares.service.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomSharesService {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
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

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async list(actor: AuthenticatedUser, roomId: string) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);

        const shares = await this.shareModel
            .find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .lean();

        return shares.map((share) => this.toView(share));
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async findUsableSharesForRoom(roomId: string, sourceIds: string[] = []) {
        const filter: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
        };

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (sourceIds.length > 0) {
            filter._id = { $in: sourceIds.map((id) => new Types.ObjectId(id)) };
        }

        return this.shareModel.find(filter).sort({ createdAt: -1 });
    }

    private assertStudent(actor: AuthenticatedUser) {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (actor.role !== "STUDENT") {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/study-rooms/room-shares.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-shares.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-shares.controller.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomSharesController {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Atualizar módulo da sala

1. Explicação simples do objetivo.

    Neste passo vais atualizar módulo da sala nos ficheiros `apps/api/src/modules/study-rooms/study-rooms.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- EDITAR: `apps/api/src/modules/study-rooms/study-rooms.module.ts`
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

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/roomShares.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/roomShares.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/roomShares.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
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
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<RoomShareView>(response);
}

export async function listRoomShares(roomId: string) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/study-rooms/${roomId}/shares`, {
        credentials: "include",
    });

    return parseResponse<RoomShareView[]>(response);
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página da sala

1. Explicação simples do objetivo.

    Neste passo vais criar página da sala nos ficheiros `apps/web/src/pages/student/RoomSharesPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/student/RoomSharesPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/student/RoomSharesPage.tsx
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { FormEvent, useEffect, useState } from "react";
import { RoomShareView, createRoomShare, listRoomShares } from "../../lib/api/roomShares";

type Props = {
    roomId: string;
};

// Comentário pedagógico: esta função isola uma transformação para o service não ficar sobrecarregado.
export function RoomSharesPage({ roomId }: Props) {
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [shares, setShares] = useState<RoomShareView[]>([]);
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [error, setError] = useState("");

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async function refresh() {
        setShares(await listRoomShares(roomId));
    }

    // Comentário pedagógico: useEffect carrega dados quando a página abre ou quando um ID muda.
    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, [roomId]);

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    // Comentário pedagógico: esta função trata o formulário sem recarregar a página.
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

    // Comentário pedagógico: o JSX abaixo define o que aparece no browser.
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

    - Membro cria `NOTE` com texto e `usableByAi` fica verdadeiro.
- Membro cria `URL` e `usableByAi` fica falso sem texto copiado.
- Não membro recebe `403`.
- Professor recebe `403`.
- Listagem só funciona para membros.
- `RoomSharesService.findUsableSharesForRoom` devolve apenas fontes textuais.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

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
