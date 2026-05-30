# BK-MF1-01 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.

## Header
- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-11`
- `rf_rnf`: `RF13`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF13`: permitir que a IA adapte explicações ao ritmo, dificuldades e estilo de estudo do aluno, usando apenas materiais processáveis da área de estudo do próprio aluno.

## Importância
Adaptação pedagógica só é segura se continuar baseada em fontes. O perfil do aluno altera a forma de explicar, mas não autoriza a IA a inventar factos nem a consultar materiais de outras áreas ou de outros alunos.

## Scope-in
- Criar perfil de aprendizagem por aluno e área de estudo.
- Guardar ritmo, nível, dificuldades e estilo preferido.
- Gerar explicação adaptada com base em materiais `READY`.
- Bloquear geração sem fontes.
- Guardar resposta e fontes usadas.

## Scope-out
- Diagnóstico clínico ou psicológico.
- Perfil global para todas as áreas.
- Materiais oficiais de turma.
- IA partilhada de sala.

## Estado antes
- `BK-MF0-07` criou áreas de estudo.
- `BK-MF0-08` criou materiais com `contentText` quando estão prontos.
- `BK-MF0-11` criou provider IA e artefactos de IA.

## Estado depois
- Aluno configura perfil numa área.
- Aluno pede explicação adaptada.
- API responde com fontes da própria área.
- API devolve `422` se não houver materiais processáveis.

## Pré-requisitos
- `StudyAreasService.getMyStudyArea`.
- `Material` com `status: "READY"` e `contentText`.
- `SessionGuard`.
- `AI_PROVIDER` isolado atrás do `AiModule`.

## Glossário
- **Perfil de aprendizagem**: preferências pedagógicas do aluno numa área.
- **Ritmo**: velocidade e granularidade da explicação.
- **Dificuldade**: ponto onde o aluno sente bloqueio.
- **Fonte processável**: material com texto guardado e pronto para IA.

## Conceitos teóricos
A personalização tem limites. O sistema pode ajustar linguagem, passos e exemplos, mas a resposta continua presa às fontes. Se as fontes não existirem, a resposta correta é bloquear e explicar que faltam materiais processáveis.

## Arquitetura do BK
- `apps/api/src/modules/ai/schemas/learning-profile.schema.ts`
- `apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts`
- `apps/api/src/modules/ai/dto/update-learning-profile.dto.ts`
- `apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts`
- `apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts`
- `apps/api/src/modules/ai/providers/ai-provider.ts`
- `apps/api/src/modules/ai/adaptive-learning.service.ts`
- `apps/api/src/modules/ai/adaptive-learning.controller.ts`
- `apps/api/src/modules/ai/ai.module.ts`
- `apps/web/src/lib/api/adaptiveLearning.ts`
- `apps/web/src/pages/student/AdaptiveLearningPage.tsx`

Endpoints:
- `GET /api/study-areas/:studyAreaId/learning-profile`
- `PUT /api/study-areas/:studyAreaId/learning-profile`
- `POST /api/study-areas/:studyAreaId/adaptive-explanations`

## Guia linear de implementação

### Passo 1 - Criar schema do perfil

```ts
// apps/api/src/modules/ai/schemas/learning-profile.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LearningProfileDocument = HydratedDocument<LearningProfile>;
export type LearningPace = "SLOW" | "BALANCED" | "FAST";
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

@Schema({ timestamps: true, collection: "learning_profiles" })
export class LearningProfile {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SLOW", "BALANCED", "FAST"], default: "BALANCED" })
    pace!: LearningPace;

    @Prop({ required: true, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" })
    level!: LearningLevel;

    @Prop({ type: [String], default: [] })
    difficulties!: string[];

    @Prop({ trim: true, maxlength: 200 })
    preferredExplanationStyle?: string;
}

export const LearningProfileSchema = SchemaFactory.createForClass(LearningProfile);
LearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });
```

### Passo 2 - Criar schema da explicação

```ts
// apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

@Schema({ timestamps: true, collection: "adaptive_explanations" })
export class AdaptiveExplanation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 300 })
    topic!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;

    @Prop({ type: [String], default: [] })
    adaptationNotes!: string[];
}

export const AdaptiveExplanationSchema = SchemaFactory.createForClass(AdaptiveExplanation);
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
```

### Passo 3 - Criar DTOs

```ts
// apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateLearningProfileDto {
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace!: "SLOW" | "BALANCED" | "FAST";

    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level!: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    difficulties?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(200)
    preferredExplanationStyle?: string;
}
```

```ts
// apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskAdaptiveExplanationDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    topic!: string;
}
```

### Passo 4 - Criar prompt

```ts
// apps/api/src/modules/ai/prompts/adaptive-explanation.prompt.ts
import { MaterialDocument } from "../../materials/schemas/material.schema";
import { LearningProfileDocument } from "../schemas/learning-profile.schema";

type BuildAdaptivePromptInput = {
    topic: string;
    profile: LearningProfileDocument;
    materials: MaterialDocument[];
};

export function buildAdaptiveExplanationPrompt(input: BuildAdaptivePromptInput) {
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.contentText ?? ""}`;
        })
        .join("\n\n");

    return [
        "Explica apenas com base nas fontes do aluno fornecidas.",
        "Adapta linguagem, ritmo e detalhe ao perfil, mas não acrescentes factos fora das fontes.",
        `Tópico pedido: ${input.topic}`,
        `Ritmo: ${input.profile.pace}`,
        `Nível: ${input.profile.level}`,
        `Dificuldades: ${input.profile.difficulties.join(" | ") || "sem dificuldades registadas"}`,
        `Estilo preferido: ${input.profile.preferredExplanationStyle ?? "claro e passo a passo"}`,
        sources,
        "Devolve JSON com answer, sourceMaterialIds e adaptationNotes.",
    ].join("\n\n");
}
```

### Passo 5 - Alargar provider IA
Este BK parte do provider criado na MF0 e acrescenta um método específico para explicações adaptadas.

```ts
// apps/api/src/modules/ai/providers/ai-provider.ts
import {
    BadGatewayException,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import OpenAI from "openai";

export type AiSource = {
    materialId: string;
    title: string;
    contentText: string;
};

export type SummaryResult = {
    title: string;
    bullets: string[];
    sourceMaterialIds: string[];
};

export type AdaptiveExplanationResult = {
    answer: string;
    sourceMaterialIds: string[];
    adaptationNotes: string[];
};

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const AI_PROVIDER = Symbol("AI_PROVIDER");

export interface AiProvider {
    generateSummary(input: { prompt: string }): Promise<SummaryResult>;
    generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult>;
    generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
    async generateSummary(input: { prompt: string }): Promise<SummaryResult> {
        return this.createJsonResponse<SummaryResult>(input.prompt);
    }

    async generateAdaptiveExplanation(input: { prompt: string }): Promise<AdaptiveExplanationResult> {
        return this.createJsonResponse<AdaptiveExplanationResult>(input.prompt);
    }

    async generateStudyTool(input: {
        prompt: string;
        type: StudyToolType;
    }): Promise<Record<string, unknown>> {
        return this.createJsonResponse<Record<string, unknown>>(input.prompt);
    }

    private async createJsonResponse<T>(prompt: string): Promise<T> {
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL;

        if (!apiKey || !model) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_NOT_CONFIGURED",
                message: "O serviço de IA ainda não está configurado.",
            });
        }

        const client = new OpenAI({ apiKey });
        const response = await client.responses.create({
            model,
            input: prompt,
        });

        try {
            return JSON.parse(response.output_text ?? "{}") as T;
        } catch {
            throw new BadGatewayException({
                code: "AI_PROVIDER_INVALID_JSON",
                message: "A IA devolveu uma resposta inválida.",
            });
        }
    }
}
```

### Passo 6 - Criar service

```ts
// apps/api/src/modules/ai/adaptive-learning.service.ts
import {
    Inject,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Material, MaterialDocument } from "../materials/schemas/material.schema";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";
import { AI_PROVIDER, AiProvider } from "./providers/ai-provider";
import { buildAdaptiveExplanationPrompt } from "./prompts/adaptive-explanation.prompt";
import {
    AdaptiveExplanation,
    AdaptiveExplanationDocument,
} from "./schemas/adaptive-explanation.schema";
import { LearningProfile, LearningProfileDocument } from "./schemas/learning-profile.schema";

@Injectable()
export class AdaptiveLearningService {
    constructor(
        @InjectModel(LearningProfile.name)
        private readonly profileModel: Model<LearningProfileDocument>,
        @InjectModel(AdaptiveExplanation.name)
        private readonly explanationModel: Model<AdaptiveExplanationDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async getProfile(userId: string, studyAreaId: string) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        return profile ? this.toProfileView(profile) : this.defaultProfile(studyAreaId);
    }

    async updateProfile(userId: string, studyAreaId: string, dto: UpdateLearningProfileDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            },
            {
                pace: dto.pace,
                level: dto.level,
                difficulties: this.cleanList(dto.difficulties ?? []),
                preferredExplanationStyle: dto.preferredExplanationStyle?.trim(),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toProfileView(profile);
    }

    async explain(userId: string, studyAreaId: string, dto: AskAdaptiveExplanationDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        const effectiveProfile =
            profile ??
            (await this.profileModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                pace: "BALANCED",
                level: "BEGINNER",
                difficulties: [],
            }));

        const materials = await this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                contentText: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .limit(8);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta área ainda não tem materiais processáveis para gerar explicação.",
            );
        }

        const prompt = buildAdaptiveExplanationPrompt({
            topic: dto.topic.trim(),
            profile: effectiveProfile,
            materials,
        });

        let result;
        try {
            result = await this.aiProvider.generateAdaptiveExplanation({ prompt });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const sources = materials.map((material) => ({
            materialId: material._id.toString(),
            title: material.title,
        }));

        const explanation = await this.explanationModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            topic: dto.topic.trim(),
            answer: result.answer,
            sources,
            adaptationNotes: result.adaptationNotes,
        });

        return {
            id: explanation._id.toString(),
            topic: explanation.topic,
            answer: explanation.answer,
            sources: explanation.sources,
            adaptationNotes: explanation.adaptationNotes,
        };
    }

    private async ensureStudyArea(userId: string, studyAreaId: string) {
        const studyArea = await this.studyAreasService.getMyStudyArea(userId, studyAreaId);

        if (!studyArea) {
            throw new NotFoundException("Área de estudo não encontrada.");
        }

        return studyArea;
    }

    private cleanList(values: string[]) {
        return values.map((value) => value.trim()).filter(Boolean).slice(0, 8);
    }

    private defaultProfile(studyAreaId: string) {
        return {
            id: "",
            studyAreaId,
            pace: "BALANCED",
            level: "BEGINNER",
            difficulties: [],
            preferredExplanationStyle: "",
        };
    }

    private toProfileView(profile: LearningProfile | LearningProfileDocument) {
        return {
            id: profile._id.toString(),
            studyAreaId: profile.studyAreaId.toString(),
            pace: profile.pace,
            level: profile.level,
            difficulties: profile.difficulties,
            preferredExplanationStyle: profile.preferredExplanationStyle ?? "",
        };
    }
}
```

### Passo 7 - Criar controller e atualizar módulo

```ts
// apps/api/src/modules/ai/adaptive-learning.controller.ts
import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";

@Controller("api/study-areas/:studyAreaId")
@UseGuards(SessionGuard)
export class AdaptiveLearningController {
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    @Get("learning-profile")
    getProfile(@Req() request: AuthenticatedRequest, @Param("studyAreaId") studyAreaId: string) {
        return this.adaptiveLearningService.getProfile(request.user!.id, studyAreaId);
    }

    @Put("learning-profile")
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: UpdateLearningProfileDto,
    ) {
        return this.adaptiveLearningService.updateProfile(request.user!.id, studyAreaId, dto);
    }

    @Post("adaptive-explanations")
    explain(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: AskAdaptiveExplanationDto,
    ) {
        return this.adaptiveLearningService.explain(request.user!.id, studyAreaId, dto);
    }
}
```

```ts
// apps/api/src/modules/ai/ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Material, MaterialSchema } from "../materials/schemas/material.schema";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AdaptiveLearningController } from "./adaptive-learning.controller";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "./schemas/adaptive-explanation.schema";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema";
import { LearningProfile, LearningProfileSchema } from "./schemas/learning-profile.schema";
import { SummariesController } from "./summaries.controller";
import { SummariesService } from "./summaries.service";

@Module({
    imports: [
        StudyAreasModule,
        MongooseModule.forFeature([
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
    ],
    controllers: [SummariesController, AdaptiveLearningController],
    providers: [
        SummariesService,
        AdaptiveLearningService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [AI_PROVIDER],
})
export class AiModule {}
```

### Passo 8 - Criar cliente e página

```ts
// apps/web/src/lib/api/adaptiveLearning.ts
export type LearningProfileView = {
    id: string;
    studyAreaId: string;
    pace: "SLOW" | "BALANCED" | "FAST";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    difficulties: string[];
    preferredExplanationStyle: string;
};

export type AdaptiveExplanationView = {
    id: string;
    topic: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
    adaptationNotes: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function getLearningProfile(studyAreaId: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        credentials: "include",
    });

    return parseResponse<LearningProfileView>(response);
}

export async function updateLearningProfile(
    studyAreaId: string,
    input: Omit<LearningProfileView, "id" | "studyAreaId">,
) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/learning-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<LearningProfileView>(response);
}

export async function askAdaptiveExplanation(studyAreaId: string, topic: string) {
    const response = await fetch(`/api/study-areas/${studyAreaId}/adaptive-explanations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    });

    return parseResponse<AdaptiveExplanationView>(response);
}
```

```tsx
// apps/web/src/pages/student/AdaptiveLearningPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    AdaptiveExplanationView,
    LearningProfileView,
    askAdaptiveExplanation,
    getLearningProfile,
    updateLearningProfile,
} from "../../lib/api/adaptiveLearning";

type Props = {
    studyAreaId: string;
};

export function AdaptiveLearningPage({ studyAreaId }: Props) {
    const [profile, setProfile] = useState<LearningProfileView | null>(null);
    const [explanation, setExplanation] = useState<AdaptiveExplanationView | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getLearningProfile(studyAreaId)
            .then(setProfile)
            .catch((reason: Error) => setError(reason.message));
    }, [studyAreaId]);

    async function handleProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const difficulties = String(form.get("difficulties") ?? "")
            .split("\n")
            .map((difficulty) => difficulty.trim())
            .filter(Boolean);

        const updated = await updateLearningProfile(studyAreaId, {
            pace: String(form.get("pace") ?? "BALANCED") as LearningProfileView["pace"],
            level: String(form.get("level") ?? "BEGINNER") as LearningProfileView["level"],
            difficulties,
            preferredExplanationStyle: String(form.get("preferredExplanationStyle") ?? ""),
        });

        setProfile(updated);
    }

    async function handleQuestion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);

        try {
            setExplanation(await askAdaptiveExplanation(studyAreaId, String(form.get("topic") ?? "")));
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível gerar explicação.");
        }
    }

    return (
        <main>
            <h1>Explicações adaptadas</h1>
            <form onSubmit={handleProfile}>
                <select name="pace" defaultValue={profile?.pace ?? "BALANCED"}>
                    <option value="SLOW">Devagar</option>
                    <option value="BALANCED">Equilibrado</option>
                    <option value="FAST">Rápido</option>
                </select>
                <select name="level" defaultValue={profile?.level ?? "BEGINNER"}>
                    <option value="BEGINNER">Inicial</option>
                    <option value="INTERMEDIATE">Intermédio</option>
                    <option value="ADVANCED">Avançado</option>
                </select>
                <textarea name="difficulties" defaultValue={profile?.difficulties.join("\n") ?? ""} />
                <input
                    name="preferredExplanationStyle"
                    defaultValue={profile?.preferredExplanationStyle ?? ""}
                    placeholder="Estilo preferido"
                />
                <button type="submit">Guardar perfil</button>
            </form>

            <form onSubmit={handleQuestion}>
                <input name="topic" placeholder="Tópico" required />
                <button type="submit">Gerar explicação</button>
            </form>

            {error ? <p role="alert">{error}</p> : null}

            {explanation ? (
                <section>
                    <p>{explanation.answer}</p>
                    <h2>Fontes</h2>
                    <ul>
                        {explanation.sources.map((source) => (
                            <li key={source.materialId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}
```

## Critérios de aceite
- Perfil é único por aluno e área.
- Área é validada por `StudyAreasService.getMyStudyArea`.
- Só materiais `READY` com `contentText` entram no prompt.
- Sem fontes há `422`.
- Resposta guarda fontes e notas de adaptação.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa área alheia, área sem materiais processáveis e área com pelo menos um material `READY`.

## Evidence para PR/defesa
- Screenshot de perfil guardado.
- Screenshot de explicação com fontes.
- Resposta `422` sem fontes.
- Resposta `404` para área fora do aluno.

## Handoff
`BK-MF1-02` inicia a cadeia colaborativa. Este BK fica no contexto individual do aluno e não deve usar turmas, disciplinas ou salas.

## Changelog
- 2026-05-30: Guia reescrito com perfil por área, fontes da MF0 e integração completa no módulo de IA.
