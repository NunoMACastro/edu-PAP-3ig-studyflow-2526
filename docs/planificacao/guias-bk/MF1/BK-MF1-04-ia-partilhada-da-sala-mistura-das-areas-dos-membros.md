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
**IA partilhada da sala.** Esta IA responde com base nas partilhas textuais feitas pelos membros da sala. Ela não usa materiais privados do aluno, materiais oficiais de turma nem conteúdo de outras salas.

**O que são `sourceIds`.** `sourceIds` é uma lista opcional de IDs de partilhas que o aluno escolhe no frontend para focar a resposta. Por exemplo, a página pode mostrar três apontamentos partilhados e o aluno selecciona dois. Esses dois `_id` seguem no body do pedido como `sourceIds`.

**De onde vêm e para onde vão os `sourceIds`.** Os IDs nascem nos registos `RoomShare` guardados em MongoDB, são apresentados pela UI, voltam para o backend no DTO `AskRoomAiDto`, e são usados pelo service apenas para filtrar fontes que já pertencem à sala. Eles nunca dão acesso directo a documentos.

**Porque `sourceIds` não são confiáveis.** Um aluno pode alterar o pedido no browser e enviar IDs de outra sala. Por isso, o backend cruza sempre os IDs recebidos com `roomId` e `usableByAi: true`. Se o ID não pertence à sala, não entra no prompt.

**Resposta com fontes.** A resposta devolve `sources` com `shareId` e `title`. Isto permite ao aluno perceber que apontamentos sustentaram a explicação e ajuda a defender que a IA respeitou o contexto da sala.

**Bloqueio sem fontes.** Se a sala não tiver partilhas textuais, o endpoint devolve `422`. A IA não deve responder só porque recebeu uma pergunta; precisa de material partilhado e validado.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

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

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `StudyRoomsService.ensureMember`.
- `RoomSharesService.findUsableSharesForRoom`.
- `AiModule` com `AI_PROVIDER` exportado.

### Passo 1 - Criar schema da interação

1. Explicação simples do objetivo.

    Neste passo vais criar schema da interação nos ficheiros `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/schemas/room-ai-interaction.schema.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type RoomAiInteractionDocument = HydratedDocument<RoomAiInteraction>;

// Comentário pedagógico: @Schema transforma a classe num modelo persistido pelo Mongoose.
@Schema({ timestamps: true, collection: "room_ai_interactions" })
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomAiInteraction {
    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, trim: true, maxlength: 800 })
    question!: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ shareId: string; title: string }>;
}

export const RoomAiInteractionSchema = SchemaFactory.createForClass(RoomAiInteraction);
RoomAiInteractionSchema.index({ roomId: 1, createdAt: -1 });
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar prompt

1. Explicação simples do objetivo.

    Neste passo vais criar prompt nos ficheiros `apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/prompts/room-ai.prompt.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { RoomShareDocument } from "../schemas/room-share.schema";

// Comentário pedagógico: esta função isola uma transformação para o service não ficar sobrecarregado.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/study-rooms/room-ai.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-ai.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-ai.service.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomAiService {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async answer(actor: AuthenticatedUser, roomId: string, dto: AskRoomAiDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const shares = await this.roomSharesService.findUsableSharesForRoom(
            room._id.toString(),
            dto.sourceIds ?? [],
        );

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (shares.length === 0) {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
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
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
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
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (actor.role !== "STUDENT") {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
            throw new ForbiddenException("Apenas alunos membros podem usar a IA da sala.");
        }
    }
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/study-rooms/room-ai.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/study-rooms/room-ai.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/study-rooms/room-ai.controller.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class RoomAiController {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Atualizar módulo da sala

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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class StudyRoomsModule {}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar cliente e página

1. Explicação simples do objetivo.

    Neste passo vais criar cliente e página nos ficheiros `apps/web/src/lib/api/roomAi.ts`, `apps/web/src/pages/student/RoomAiPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/roomAi.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/web/src/pages/student/RoomAiPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/roomAi.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type RoomAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ shareId: string; title: string }>;
};

export async function askRoomAi(roomId: string, input: { question: string; sourceIds?: string[] }) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<RoomAiAnswer>;
}
```

```tsx
// apps/web/src/pages/student/RoomAiPage.tsx
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { FormEvent, useState } from "react";
import { RoomAiAnswer, askRoomAi } from "../../lib/api/roomAi";

type Props = {
    roomId: string;
};

// Comentário pedagógico: esta função isola uma transformação para o service não ficar sobrecarregado.
export function RoomAiPage({ roomId }: Props) {
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [answer, setAnswer] = useState<RoomAiAnswer | null>(null);
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [error, setError] = useState("");
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [isLoading, setIsLoading] = useState(false);

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    // Comentário pedagógico: esta função trata o formulário sem recarregar a página.
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

    // Comentário pedagógico: o JSX abaixo define o que aparece no browser.
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

    - Membro recebe resposta com fontes.
- Não membro recebe `403`.
- Sala sem fontes textuais recebe `422`.
- `sourceIds` de outra sala não entram nas fontes.
- A interação fica gravada.
- A resposta mostra fontes usadas.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

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
