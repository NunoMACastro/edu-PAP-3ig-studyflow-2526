# BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.

## Header
- `doc_id`: `GUIA-BK-MF1-11`
- `bk_id`: `BK-MF1-11`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF23`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-12`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF23`: permitir que um aluno inscrito numa turma use uma IA limitada aos materiais oficiais da disciplina.

## Importância
Este é um dos pontos de maior risco da MF1. A IA não pode misturar disciplinas, turmas ou alunos. A resposta tem de usar apenas materiais oficiais `PROCESSED` e deve aplicar a voz docente sem ultrapassar as fontes.

## Scope-in
- Criar interação de IA por disciplina.
- Confirmar inscrição do aluno na turma da disciplina.
- Usar apenas materiais oficiais processados.
- Aplicar voz docente.
- Guardar pergunta, resposta e fontes usadas.

## Scope-out
- Chat em tempo real.
- Materiais privados do aluno.
- Conhecimento externo sem fonte oficial.
- IA para aluno não inscrito.

## Estado antes
- Existem turmas com `studentIds`.
- Existem disciplinas.
- Existem materiais oficiais e voz docente.

## Estado depois
- Aluno inscrito pergunta sobre uma disciplina.
- API responde com fontes oficiais.
- API devolve `422` se não houver material oficial processado.
- Interação fica registada.

## Pré-requisitos
- `BK-MF1-07` com aluno inscrito em `SchoolClass.studentIds`.
- `BK-MF1-08` com `SubjectsService.findSubjectForStudent`.
- `BK-MF1-09` com `OfficialMaterialsService.findProcessedBySubject`.
- `BK-MF1-10` com `TeacherAiVoiceService.findForSubject`.
- `AiModule` com `AI_PROVIDER` exportado pelos BKs de IA da MF0.

## Glossário
- **IA limitada**: IA que responde apenas com fontes oficiais da disciplina.
- **Fonte oficial processada**: material `TEXT` submetido pelo professor e marcado como `PROCESSED`.
- **Interação**: pergunta e resposta guardadas para histórico e defesa.

## Conceitos teóricos
Uma resposta de IA tem duas proteções: validação antes da chamada e instrução no prompt. A validação garante que há fontes e que o aluno está inscrito. O prompt limita a resposta ao conteúdo recebido. As duas camadas são necessárias.

## Arquitetura do BK
- `apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts`
- `apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts`
- `apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts`
- `apps/api/src/modules/class-ai/class-ai.service.ts`
- `apps/api/src/modules/class-ai/class-ai.controller.ts`
- `apps/api/src/modules/class-ai/class-ai.module.ts`
- `apps/web/src/lib/api/classAi.ts`
- `apps/web/src/pages/student/StudentClassAiPage.tsx`

Endpoint:
- `POST /api/student/subjects/:subjectId/ai/answers`

## Guia linear de implementação

### Passo 1 - Criar schema da interação

```ts
// apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type ClassAiInteractionDocument = HydratedDocument<ClassAiInteraction>;

@Schema({ timestamps: true, collection: "class_ai_interactions" })
export class ClassAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 800 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;
}

export const ClassAiInteractionSchema = SchemaFactory.createForClass(ClassAiInteraction);
ClassAiInteractionSchema.index({ studentId: 1, subjectId: 1, createdAt: -1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskClassAiDto {
    @IsString()
    @MinLength(10)
    @MaxLength(800)
    question!: string;
}
```

### Passo 3 - Criar prompt

```ts
// apps/api/src/modules/class-ai/prompts/class-ai.prompt.ts
import { OfficialMaterialDocument } from "../../official-materials/schemas/official-material.schema";
import { TeacherAiVoiceDocument } from "../../teacher-ai/schemas/teacher-ai-voice.schema";

type BuildClassAiPromptInput = {
    question: string;
    materials: OfficialMaterialDocument[];
    voice: TeacherAiVoiceDocument | null;
};

export function buildClassAiPrompt(input: BuildClassAiPromptInput) {
    const tone = input.voice?.tone ?? "CALM";
    const detailLevel = input.voice?.detailLevel ?? "BALANCED";
    const rules = input.voice?.rules ?? [];
    const sources = input.materials
        .map((material, index) => {
            return `Fonte ${index + 1}: ${material.title}\n${material.textContent ?? ""}`;
        })
        .join("\n\n");

    return [
        "Responde apenas com base nas fontes oficiais fornecidas.",
        "Se a pergunta não estiver coberta pelas fontes, diz que a disciplina ainda não tem material oficial suficiente.",
        `Tom docente: ${tone}.`,
        `Nível de detalhe: ${detailLevel}.`,
        rules.length > 0 ? `Regras do professor: ${rules.join(" | ")}` : "Sem regras adicionais do professor.",
        `Pergunta do aluno: ${input.question}`,
        sources,
        "Devolve JSON com as chaves answer e sourceMaterialIds.",
    ].join("\n\n");
}
```

### Passo 4 - Criar service

```ts
// apps/api/src/modules/class-ai/class-ai.service.ts
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
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";
import { buildClassAiPrompt } from "./prompts/class-ai.prompt";
import {
    ClassAiInteraction,
    ClassAiInteractionDocument,
} from "./schemas/class-ai-interaction.schema";

@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly teacherAiVoiceService: TeacherAiVoiceService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async answer(actor: AuthenticatedUser, subjectId: string, dto: AskClassAiDto) {
        this.assertStudent(actor);

        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta disciplina ainda não tem materiais oficiais processados.",
            );
        }

        const voice = await this.teacherAiVoiceService.findForSubject(subject);
        const prompt = buildClassAiPrompt({
            question: dto.question.trim(),
            materials,
            voice,
        });

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
        const sources = materials.map((material) => ({
            materialId: material._id.toString(),
            title: material.title,
        }));

        const interaction = await this.interactionModel.create({
            studentId: new Types.ObjectId(actor.id),
            classId: subject.classId,
            subjectId: subject._id,
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
            throw new ForbiddenException("Apenas alunos inscritos podem usar a IA da disciplina.");
        }
    }
}
```

### Passo 5 - Criar controller

```ts
// apps/api/src/modules/class-ai/class-ai.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassAiService } from "./class-ai.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";

@Controller("api/student/subjects/:subjectId/ai/answers")
@UseGuards(SessionGuard)
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    answer(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: AskClassAiDto,
    ) {
        return this.classAiService.answer(request.user as AuthenticatedUser, subjectId, dto);
    }
}
```

### Passo 6 - Criar módulo

```ts
// apps/api/src/modules/class-ai/class-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module";
import { ClassAiController } from "./class-ai.controller";
import { ClassAiService } from "./class-ai.service";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "./schemas/class-ai-interaction.schema";

@Module({
    imports: [
        AiModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
        ]),
    ],
    controllers: [ClassAiController],
    providers: [ClassAiService],
})
export class ClassAiModule {}
```

### Passo 7 - Criar cliente e página

```ts
// apps/web/src/lib/api/classAi.ts
export type ClassAiAnswer = {
    id: string;
    answer: string;
    sources: Array<{ materialId: string; title: string }>;
};

export async function askClassAi(subjectId: string, question: string) {
    const response = await fetch(`/api/student/subjects/${subjectId}/ai/answers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<ClassAiAnswer>;
}
```

```tsx
// apps/web/src/pages/student/StudentClassAiPage.tsx
import { FormEvent, useState } from "react";
import { ClassAiAnswer, askClassAi } from "../../lib/api/classAi";

type Props = {
    subjectId: string;
};

export function StudentClassAiPage({ subjectId }: Props) {
    const [answer, setAnswer] = useState<ClassAiAnswer | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            setAnswer(await askClassAi(subjectId, String(form.get("question") ?? "")));
            event.currentTarget.reset();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível obter resposta.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>IA da disciplina</h1>
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
                    <h2>Fontes usadas</h2>
                    <ul>
                        {answer.sources.map((source) => (
                            <li key={source.materialId}>{source.title}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}
```

### Passo 8 - Validar comportamento
- Aluno inscrito recebe resposta com fontes.
- Aluno não inscrito recebe `403`.
- Professor recebe `403`.
- Disciplina sem materiais `PROCESSED` devolve `422`.
- A resposta guarda interação com `studentId`, `classId` e `subjectId`.
- A IA não usa materiais `REFERENCE_ONLY`.

## Critérios de aceite
- Inscrição é validada via `SchoolClass.studentIds`.
- Fontes oficiais vêm de `OfficialMaterialsService`.
- Voz docente vem de `TeacherAiVoiceService`.
- Sem materiais processados há `422`.
- Resposta mostra fontes usadas.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Inclui testes de acesso cruzado entre turmas.

## Evidence para PR/defesa
- Pergunta de aluno inscrito com fontes visíveis.
- Resposta `422` sem material processado.
- Resposta `403` para aluno não inscrito.
- Registo de `ClassAiInteraction`.

## Handoff
`BK-MF1-12` usa a mesma inscrição por `studentIds` para proteger leitura de publicações por alunos.

## Changelog
- 2026-05-30: Guia reescrito para depender de inscrição real, materiais oficiais processados e voz docente.
