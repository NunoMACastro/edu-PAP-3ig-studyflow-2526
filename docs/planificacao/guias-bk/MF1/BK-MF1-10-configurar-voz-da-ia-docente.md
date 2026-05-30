# BK-MF1-10 - Configurar “voz da IA” docente.

## Header
- `doc_id`: `GUIA-BK-MF1-10`
- `bk_id`: `BK-MF1-10`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-09`
- `rf_rnf`: `RF22`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-11`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-10-configurar-voz-da-ia-docente.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF22`: permitir que o professor configure a voz pedagógica da IA para uma disciplina.

## Importância
A IA limitada do aluno não deve soar genérica. Deve respeitar o tom, nível de detalhe e regras definidos pelo professor, mas sem ignorar guardrails: a voz altera forma e pedagogia, não autoriza respostas sem fontes.

## Scope-in
- Criar `TeacherAiVoice`.
- Guardar tom, nível de detalhe e regras.
- Ter uma configuração por disciplina.
- Expor `PUT` para criação/atualização.
- Disponibilizar leitura para a IA limitada.

## Scope-out
- Voz por aluno.
- Voz global da escola.
- Configuração de modelo externo.
- Permissão para responder sem materiais oficiais.

## Estado antes
- Existem disciplinas e materiais oficiais.
- Ainda não existe configuração docente de IA.

## Estado depois
- Professor configura voz da IA numa disciplina sua.
- A configuração pode ser atualizada com `PUT`.
- `BK-MF1-11` consegue aplicar a voz ao prompt.

## Pré-requisitos
- `BK-MF1-08` com `SubjectsService.findOwnedSubject`.
- `SessionGuard`.
- Validação global de DTOs.

## Glossário
- **Tom**: estilo de comunicação, por exemplo calmo ou direto.
- **Nível de detalhe**: profundidade esperada da explicação.
- **Regra pedagógica**: instrução curta definida pelo professor.

## Conceitos teóricos
Configuração de voz é dado pedagógico, não autorização. Mesmo que a regra peça uma resposta longa, o service da IA continua obrigado a usar apenas materiais oficiais processados.

## Arquitetura do BK
- `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`
- `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`
- `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`
- `apps/web/src/lib/api/teacherAiVoice.ts`
- `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`

Endpoints:
- `PUT /api/teacher/subjects/:subjectId/ai-voice`
- `GET /api/teacher/subjects/:subjectId/ai-voice`

## Guia linear de implementação

### Passo 1 - Criar schema

```ts
// apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TeacherAiVoiceDocument = HydratedDocument<TeacherAiVoice>;
export type TeacherAiTone = "CALM" | "DIRECT" | "SOCRATIC";
export type TeacherAiDetailLevel = "SHORT" | "BALANCED" | "DETAILED";

@Schema({ timestamps: true, collection: "teacher_ai_voices" })
export class TeacherAiVoice {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, unique: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"], default: "CALM" })
    tone!: TeacherAiTone;

    @Prop({ required: true, enum: ["SHORT", "BALANCED", "DETAILED"], default: "BALANCED" })
    detailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    rules!: string[];
}

export const TeacherAiVoiceSchema = SchemaFactory.createForClass(TeacherAiVoice);
TeacherAiVoiceSchema.index({ teacherId: 1, subjectId: 1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTeacherAiVoiceDto {
    @IsIn(["CALM", "DIRECT", "SOCRATIC"])
    tone!: "CALM" | "DIRECT" | "SOCRATIC";

    @IsIn(["SHORT", "BALANCED", "DETAILED"])
    detailLevel!: "SHORT" | "BALANCED" | "DETAILED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(180, { each: true })
    rules?: string[];
}
```

### Passo 3 - Criar service

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoice, TeacherAiVoiceDocument } from "./schemas/teacher-ai-voice.schema";

@Injectable()
export class TeacherAiVoiceService {
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async upsert(actor: AuthenticatedUser, subjectId: string, dto: UpdateTeacherAiVoiceDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const voice = await this.voiceModel.findOneAndUpdate(
            { subjectId: subject._id },
            {
                teacherId: new Types.ObjectId(actor.id),
                subjectId: subject._id,
                tone: dto.tone,
                detailLevel: dto.detailLevel,
                rules: this.cleanRules(dto.rules ?? []),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toView(voice);
    }

    async getForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const voice = await this.voiceModel.findOne({ subjectId: subject._id });
        return voice ? this.toView(voice) : this.defaultVoice(subject);
    }

    async findForSubject(subject: Subject) {
        return this.voiceModel.findOne({ subjectId: subject._id }).lean();
    }

    private cleanRules(rules: string[]) {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, 8);
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem configurar a voz da IA.");
        }
    }

    private defaultVoice(subject: Subject) {
        return {
            id: "",
            subjectId: subject._id.toString(),
            teacherId: subject.teacherId.toString(),
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    private toView(voice: TeacherAiVoice | TeacherAiVoiceDocument) {
        return {
            id: voice._id.toString(),
            subjectId: voice.subjectId.toString(),
            teacherId: voice.teacherId.toString(),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules,
        };
    }
}
```

### Passo 4 - Criar controller com método PUT

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Controller("api/teacher/subjects/:subjectId/ai-voice")
@UseGuards(SessionGuard)
export class TeacherAiVoiceController {
    constructor(private readonly teacherAiVoiceService: TeacherAiVoiceService) {}

    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: UpdateTeacherAiVoiceDto,
    ) {
        return this.teacherAiVoiceService.upsert(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.teacherAiVoiceService.getForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}
```

### Passo 5 - Criar módulo

```ts
// apps/api/src/modules/teacher-ai/teacher-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiVoice, TeacherAiVoiceSchema } from "./schemas/teacher-ai-voice.schema";
import { TeacherAiVoiceController } from "./teacher-ai-voice.controller";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: TeacherAiVoice.name, schema: TeacherAiVoiceSchema },
        ]),
    ],
    controllers: [TeacherAiVoiceController],
    providers: [TeacherAiVoiceService],
    exports: [TeacherAiVoiceService, MongooseModule],
})
export class TeacherAiModule {}
```

### Passo 6 - Criar cliente frontend com PUT

```ts
// apps/web/src/lib/api/teacherAiVoice.ts
export type TeacherAiVoiceView = {
    id: string;
    subjectId: string;
    teacherId: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function updateTeacherAiVoice(
    subjectId: string,
    input: Pick<TeacherAiVoiceView, "tone" | "detailLevel" | "rules">,
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<TeacherAiVoiceView>(response);
}

export async function getTeacherAiVoice(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        credentials: "include",
    });

    return parseResponse<TeacherAiVoiceView>(response);
}
```

### Passo 7 - Criar página do professor

```tsx
// apps/web/src/pages/teacher/TeacherAiVoicePage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    TeacherAiVoiceView,
    getTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/api/teacherAiVoice";

type Props = {
    subjectId: string;
};

export function TeacherAiVoicePage({ subjectId }: Props) {
    const [voice, setVoice] = useState<TeacherAiVoiceView | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getTeacherAiVoice(subjectId)
            .then(setVoice)
            .catch((reason: Error) => setError(reason.message));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);
        const rules = String(form.get("rules") ?? "")
            .split("\n")
            .map((rule) => rule.trim())
            .filter(Boolean);

        try {
            const updated = await updateTeacherAiVoice(subjectId, {
                tone: String(form.get("tone") ?? "CALM") as TeacherAiVoiceView["tone"],
                detailLevel: String(form.get("detailLevel") ?? "BALANCED") as TeacherAiVoiceView["detailLevel"],
                rules,
            });
            setVoice(updated);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar a voz.");
        }
    }

    return (
        <main>
            <h1>Voz da IA docente</h1>
            <form onSubmit={handleSubmit}>
                <select name="tone" defaultValue={voice?.tone ?? "CALM"}>
                    <option value="CALM">Calma</option>
                    <option value="DIRECT">Direta</option>
                    <option value="SOCRATIC">Socrática</option>
                </select>
                <select name="detailLevel" defaultValue={voice?.detailLevel ?? "BALANCED"}>
                    <option value="SHORT">Curta</option>
                    <option value="BALANCED">Equilibrada</option>
                    <option value="DETAILED">Detalhada</option>
                </select>
                <textarea name="rules" defaultValue={voice?.rules.join("\n") ?? ""} />
                <button type="submit">Guardar voz</button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
        </main>
    );
}
```

### Passo 8 - Validar comportamento
- O frontend usa `PUT`, tal como o controller.
- Professor cria configuração na primeira gravação.
- Segunda gravação atualiza a mesma configuração.
- Regras vazias são removidas.
- Aluno recebe `403`.
- Professor sem ownership recebe `404`.

## Critérios de aceite
- Uma configuração por disciplina.
- `teacherId` vem da sessão.
- Cliente e controller usam `PUT`.
- `TeacherAiModule` exporta `TeacherAiVoiceService`.
- Regras são normalizadas antes de gravar.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Confirma no diff que não existe chamada `POST` para a rota de atualização de voz.

## Evidence para PR/defesa
- Screenshot da configuração guardada.
- Segundo pedido `PUT` a atualizar a mesma configuração.
- Resposta `403` para aluno.
- Demonstração de regras vazias removidas.

## Handoff
`BK-MF1-11` deve ler `TeacherAiVoiceService.findForSubject` e usar tom, nível de detalhe e regras no prompt da IA limitada.

## Changelog
- 2026-05-30: Guia reescrito com endpoint `PUT`, sanitização de regras e módulo exportado.
