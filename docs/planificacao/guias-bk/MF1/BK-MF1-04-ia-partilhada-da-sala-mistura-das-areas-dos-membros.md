# BK-MF1-04 - IA partilhada da sala (mistura das áreas dos membros).

## Header
- `doc_id`: `GUIA-BK-MF1-04`
- `bk_id`: `BK-MF1-04`
- `macro`: `MF1`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF16`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-07`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF16`: permitir que membros de uma sala usem uma IA partilhada baseada apenas nas fontes textuais partilhadas nessa sala.

## Importância
A IA da sala mistura contribuições dos membros, mas não pode consultar materiais privados nem salas onde o aluno não é membro. A segurança depende de duas validações: membership da sala e seleção de fontes pertencentes à sala.

## Scope-in
- Criar `RoomAiInteraction`.
- Validar membership antes da chamada IA.
- Usar apenas `RoomShare.usableByAi`.
- Permitir filtrar fontes por `sourceIds`.
- Guardar pergunta, resposta e fontes.

## Scope-out
- Chat em tempo real.
- Materiais privados fora da sala.
- Voz docente.
- Respostas sem fontes.

## Estado antes
- `BK-MF1-02` criou salas.
- `BK-MF1-03` criou partilhas e fontes textuais.

## Estado depois
- Membro pergunta à IA da sala.
- API responde com fontes da sala.
- Sala sem fontes devolve `422`.
- Não membro recebe erro.

## Pré-requisitos
- `StudyRoomsService.ensureMember`.
- `RoomSharesService.findUsableSharesForRoom`.
- `AiModule` com `AI_PROVIDER` exportado.

## Glossário
- **Fonte da sala**: partilha textual com `usableByAi`.
- **sourceIds**: lista opcional de partilhas escolhidas pelo aluno.
- **Interação da sala**: registo de pergunta, resposta e fontes.

## Conceitos teóricos
A lista `sourceIds` nunca é confiável por si só. O backend tem de cruzar os IDs pedidos com as fontes da própria sala. Se o aluno enviar um ID de outra sala, esse ID simplesmente não entra na lista de fontes válidas.

## Arquitetura do BK
- `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- `apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts`
- `apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`
- `apps/api/src/modules/study-rooms/room-ai.service.ts`
- `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- `apps/api/src/modules/study-rooms/study-rooms.module.ts`
- `apps/web/src/lib/api/roomAi.ts`
- `apps/web/src/pages/student/RoomAiPage.tsx`

Endpoint:
- `POST /api/study-rooms/:roomId/ai/answers`

## Guia linear de implementação

### Passo 1 - Criar schema da interação

```ts
// apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type RoomAiInteractionDocument = HydratedDocument<RoomAiInteraction>;

@Schema({ timestamps: true, collection: "room_ai_interactions" })
export class RoomAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 800 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ shareId: string; title: string }>;
}

export const RoomAiInteractionSchema = SchemaFactory.createForClass(RoomAiInteraction);
RoomAiInteractionSchema.index({ roomId: 1, createdAt: -1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts
import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AskRoomAiDto {
    @IsString()
    @MinLength(10)
    @MaxLength(800)
    question!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(12)
    @IsMongoId({ each: true })
    sourceIds?: string[];
}
```

### Passo 3 - Criar prompt

```ts
// apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts
import { RoomShareDocument } from "../schemas/room-share.schema";

export function buildRoomAiPrompt(question: string, shares: RoomShareDocument[]) {
    const sources = shares
        .map((share, index) => {
            return `Fonte ${index + 1}: ${share.title}\n${share.textContent ?? ""}`;
        })
        .join("\n\n");

    return [
        "Responde apenas com base nas fontes partilhadas nesta sala.",
        "Se as fontes não cobrirem a pergunta, diz que a sala ainda não tem material suficiente.",
        `Pergunta: ${question}`,
        sources,
        "Devolve JSON com as chaves answer e sourceShareIds.",
    ].join("\n\n");
}
```

### Passo 4 - Criar service

```ts
// apps/api/src/modules/study-rooms/room-ai.service.ts
import {
    ForbiddenException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto";
import { buildRoomAiPrompt } from "./prompts/room-ai.prompt";
import { RoomSharesService } from "./room-shares.service";
import { RoomAiInteraction, RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
export class RoomAiService {
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async answer(actor: AuthenticatedUser, roomId: string, dto: AskRoomAiDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const shares = await this.roomSharesService.findUsableSharesForRoom(
            room._id.toString(),
            dto.sourceIds ?? [],
        );

        if (shares.length === 0) {
            throw new UnprocessableEntityException("A sala ainda não tem fontes textuais partilhadas.");
        }

        const prompt = buildRoomAiPrompt(dto.question.trim(), shares);

        let result: Record<string, unknown>;
        try {
            result = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const answer = typeof result.answer === "string" ? result.answer : "";
        const sources = shares.map((share) => ({
            shareId: share._id.toString(),
            title: share.title,
        }));

        const interaction = await this.interactionModel.create({
            roomId: room._id,
            studentId: new Types.ObjectId(actor.id),
            question: dto.question.trim(),
            answer,
            sources,
        });

        return {
            id: interaction._id.toString(),
            answer: interaction.answer,
            sources: interaction.sources,
        };
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos membros podem usar a IA da sala.");
        }
    }
}
```

### Passo 5 - Criar controller

```ts
// apps/api/src/modules/study-rooms/room-ai.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto";
import { RoomAiService } from "./room-ai.service";

@Controller("api/study-rooms/:roomId/ai/answers")
@UseGuards(SessionGuard)
export class RoomAiController {
    constructor(private readonly roomAiService: RoomAiService) {}

    @Post()
    answer(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: AskRoomAiDto,
    ) {
        return this.roomAiService.answer(request.user as AuthenticatedUser, roomId, dto);
    }
}
```

### Passo 6 - Atualizar módulo da sala

```ts
// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { Subject, SubjectSchema } from "../subjects/schemas/subject.schema";
import { RoomAiController } from "./room-ai.controller";
import { RoomAiService } from "./room-ai.service";
import { RoomSharesController } from "./room-shares.controller";
import { RoomSharesService } from "./room-shares.service";
import { RoomAiInteraction, RoomAiInteractionSchema } from "./schemas/room-ai-interaction.schema";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        AiModule,
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: RoomAiInteraction.name, schema: RoomAiInteractionSchema },
            { name: User.name, schema: UserSchema },
            { name: Subject.name, schema: SubjectSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController, RoomAiController],
    providers: [StudyRoomsService, RoomSharesService, RoomAiService],
    exports: [StudyRoomsService, RoomSharesService, MongooseModule],
})
export class StudyRoomsModule {}
```

### Passo 7 - Criar cliente e página

```ts
// apps/web/src/lib/api/roomAi.ts
export type RoomAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ shareId: string; title: string }>;
};

export async function askRoomAi(roomId: string, input: { question: string; sourceIds?: string[] }) {
    const response = await fetch(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<RoomAiAnswer>;
}
```

```tsx
// apps/web/src/pages/student/RoomAiPage.tsx
import { FormEvent, useState } from "react";
import { RoomAiAnswer, askRoomAi } from "../../lib/api/roomAi";

type Props = {
    roomId: string;
};

export function RoomAiPage({ roomId }: Props) {
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            setAnswer(await askRoomAi(roomId, { question: String(form.get("question") ?? "") }));
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível obter resposta.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>IA da sala</h1>
            <form onSubmit={handleSubmit}>
                <textarea name="question" minLength={10} required />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "A responder" : "Perguntar"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {answer ? (
                <section>
                    <p>{answer.answer}</p>
                    <h2>Fontes da sala</h2>
                    <ul>
                        {answer.sources.map((source) => (
                            <li key={source.shareId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}
```

### Passo 8 - Validar comportamento
- Membro recebe resposta com fontes.
- Não membro recebe `403`.
- Sala sem fontes textuais recebe `422`.
- `sourceIds` de outra sala não entram nas fontes.
- A interação fica gravada.
- A resposta mostra fontes usadas.

## Critérios de aceite
- Membership é validada antes da IA.
- Só `RoomShare.usableByAi` entra no prompt.
- Sem fontes há `422`.
- Interação guarda pergunta, resposta e fontes.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Inclui teste com `sourceIds` de outra sala.

## Evidence para PR/defesa
- Resposta com fontes da sala.
- Resposta `422` sem fontes.
- Resposta `403` para não membro.
- Registo de `RoomAiInteraction`.

## Handoff
`BK-MF1-07` inicia a cadeia docente. Este BK fica isolado na cadeia colaborativa de alunos e não deve alimentar IA docente oficial.

## Changelog
- 2026-05-30: Guia reescrito com fontes filtradas, módulo integrado e bloqueio sem fontes.
