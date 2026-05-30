# BK-MF1-09 - Submeter materiais da disciplina (versão oficial).

## Header
- `doc_id`: `GUIA-BK-MF1-09`
- `bk_id`: `BK-MF1-09`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-08`
- `rf_rnf`: `RF21`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-10`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-09-submeter-materiais-da-disciplina-versao-oficial.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF21`: permitir que professores submetam materiais oficiais de uma disciplina. Estes materiais são a fonte autorizada para a IA limitada de `BK-MF1-11`.

## Importância
Materiais oficiais são diferentes dos materiais privados do aluno. A IA docente só deve responder com base em fontes aprovadas pelo professor da disciplina. Este BK cria essa fronteira de dados.

## Scope-in
- Criar `OfficialMaterial`.
- Submeter material `TEXT` ou `URL`.
- Marcar `TEXT` como `PROCESSED`.
- Marcar `URL` como `REFERENCE_ONLY`.
- Listar materiais oficiais de uma disciplina do professor.

## Scope-out
- Upload de ficheiros pesados.
- Extração automática de PDF/DOCX.
- Versionamento e reversão de materiais.
- Aprovação por coordenação escolar.

## Estado antes
- `BK-MF1-08` criou disciplinas associadas a turmas.
- Ainda não existe fonte oficial por disciplina.

## Estado depois
- Professor submete texto oficial processável.
- Professor submete URL como referência.
- IA limitada só pode usar materiais `PROCESSED`.
- Materiais ficam ligados a `subjectId`, `classId` e `teacherId`.

## Pré-requisitos
- `SubjectsModule` exporta `SubjectsService`.
- `SessionGuard` funcional.
- Validação global de DTOs ativa.

## Glossário
- **Material oficial**: conteúdo fornecido pelo professor para uma disciplina.
- **PROCESSED**: texto pronto para ser usado por IA.
- **REFERENCE_ONLY**: referência guardada, mas sem texto suficiente para resposta factual.

## Conceitos teóricos
Uma URL não prova que o sistema conhece o seu conteúdo. Até existir extração e indexação, uma URL deve ser guardada como referência e não como fonte de resposta. Assim, a IA não inventa conteúdo com base num link.

## Arquitetura do BK
- `apps/api/src/modules/official-materials/schemas/official-material.schema.ts`
- `apps/api/src/modules/official-materials/dto/create-official-material.dto.ts`
- `apps/api/src/modules/official-materials/official-materials.service.ts`
- `apps/api/src/modules/official-materials/official-materials.controller.ts`
- `apps/api/src/modules/official-materials/official-materials.module.ts`
- `apps/web/src/lib/api/officialMaterials.ts`
- `apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx`

Endpoints:
- `POST /api/teacher/subjects/:subjectId/materials`
- `GET /api/teacher/subjects/:subjectId/materials`

## Guia linear de implementação

### Passo 1 - Criar schema

```ts
// apps/api/src/modules/official-materials/schemas/official-material.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OfficialMaterialDocument = HydratedDocument<OfficialMaterial>;
export type OfficialMaterialType = "TEXT" | "URL";
export type OfficialMaterialStatus = "PROCESSED" | "REFERENCE_ONLY";

@Schema({ timestamps: true, collection: "official_materials" })
export class OfficialMaterial {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["TEXT", "URL"] })
    type!: OfficialMaterialType;

    @Prop({ trim: true, maxlength: 20000 })
    textContent?: string;

    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    @Prop({ required: true, enum: ["PROCESSED", "REFERENCE_ONLY"] })
    status!: OfficialMaterialStatus;
}

export const OfficialMaterialSchema = SchemaFactory.createForClass(OfficialMaterial);
OfficialMaterialSchema.index({ subjectId: 1, createdAt: -1 });
OfficialMaterialSchema.index({ teacherId: 1, subjectId: 1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/official-materials/dto/create-official-material.dto.ts
import {
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

export class CreateOfficialMaterialDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsIn(["TEXT", "URL"])
    type!: "TEXT" | "URL";

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "TEXT")
    @IsString()
    @MinLength(20)
    @MaxLength(20000)
    textContent?: string;

    @ValidateIf((body: CreateOfficialMaterialDto) => body.type === "URL")
    @IsUrl({ require_protocol: true })
    @MaxLength(1000)
    sourceUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    notes?: string;
}
```

### Passo 3 - Criar service

```ts
// apps/api/src/modules/official-materials/official-materials.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
} from "./schemas/official-material.schema";

@Injectable()
export class OfficialMaterialsService {
    constructor(
        @InjectModel(OfficialMaterial.name)
        private readonly materialModel: Model<OfficialMaterialDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialMaterialDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const material = await this.materialModel.create({
            subjectId: subject._id,
            classId: subject.classId,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            type: dto.type,
            textContent: dto.type === "TEXT" ? dto.textContent?.trim() : undefined,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            status: dto.type === "TEXT" ? "PROCESSED" : "REFERENCE_ONLY",
        });

        return this.toView(material);
    }

    async listForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const materials = await this.materialModel
            .find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return materials.map((material) => this.toView(material));
    }

    async findProcessedBySubject(subject: Subject) {
        return this.materialModel
            .find({ subjectId: subject._id, status: "PROCESSED" })
            .sort({ createdAt: -1 });
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir materiais oficiais.");
        }
    }

    private toView(material: OfficialMaterial | OfficialMaterialDocument) {
        return {
            id: material._id.toString(),
            subjectId: material.subjectId.toString(),
            classId: material.classId.toString(),
            teacherId: material.teacherId.toString(),
            title: material.title,
            type: material.type,
            textContent: material.textContent ?? "",
            sourceUrl: material.sourceUrl ?? "",
            status: material.status,
        };
    }
}
```

### Passo 4 - Criar controller

```ts
// apps/api/src/modules/official-materials/official-materials.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import { OfficialMaterialsService } from "./official-materials.service";

@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    constructor(private readonly officialMaterialsService: OfficialMaterialsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: CreateOfficialMaterialDto,
    ) {
        return this.officialMaterialsService.create(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.officialMaterialsService.listForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}
```

### Passo 5 - Criar módulo

```ts
// apps/api/src/modules/official-materials/official-materials.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { OfficialMaterialsController } from "./official-materials.controller";
import { OfficialMaterialsService } from "./official-materials.service";
import {
    OfficialMaterial,
    OfficialMaterialSchema,
} from "./schemas/official-material.schema";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: OfficialMaterial.name, schema: OfficialMaterialSchema },
        ]),
    ],
    controllers: [OfficialMaterialsController],
    providers: [OfficialMaterialsService],
    exports: [OfficialMaterialsService, MongooseModule],
})
export class OfficialMaterialsModule {}
```

### Passo 6 - Criar cliente frontend

```ts
// apps/web/src/lib/api/officialMaterials.ts
export type OfficialMaterialView = {
    id: string;
    subjectId: string;
    classId: string;
    title: string;
    type: "TEXT" | "URL";
    textContent: string;
    sourceUrl: string;
    status: "PROCESSED" | "REFERENCE_ONLY";
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createOfficialMaterial(
    subjectId: string,
    input: { title: string; type: "TEXT" | "URL"; textContent?: string; sourceUrl?: string },
) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<OfficialMaterialView>(response);
}

export async function listOfficialMaterials(subjectId: string) {
    const response = await fetch(`/api/teacher/subjects/${subjectId}/materials`, {
        credentials: "include",
    });

    return parseResponse<OfficialMaterialView[]>(response);
}
```

### Passo 7 - Criar página do professor

```tsx
// apps/web/src/pages/teacher/TeacherOfficialMaterialsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    OfficialMaterialView,
    createOfficialMaterial,
    listOfficialMaterials,
} from "../../lib/api/officialMaterials";

type Props = {
    subjectId: string;
};

export function TeacherOfficialMaterialsPage({ subjectId }: Props) {
    const [materials, setMaterials] = useState<OfficialMaterialView[]>([]);
    const [type, setType] = useState<"TEXT" | "URL">("TEXT");
    const [error, setError] = useState("");

    async function refresh() {
        setMaterials(await listOfficialMaterials(subjectId));
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, [subjectId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            await createOfficialMaterial(subjectId, {
                title: String(form.get("title") ?? ""),
                type,
                textContent: String(form.get("textContent") ?? ""),
                sourceUrl: String(form.get("sourceUrl") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível guardar o material.");
        }
    }

    return (
        <main>
            <h1>Materiais oficiais</h1>
            <form onSubmit={handleSubmit}>
                <input name="title" placeholder="Título" required />
                <select value={type} onChange={(event) => setType(event.target.value as "TEXT" | "URL")}>
                    <option value="TEXT">Texto</option>
                    <option value="URL">URL</option>
                </select>
                {type === "TEXT" ? <textarea name="textContent" required /> : null}
                {type === "URL" ? <input name="sourceUrl" type="url" required /> : null}
                <button type="submit">Guardar material</button>
            </form>

            {error ? <p role="alert">{error}</p> : null}

            {materials.map((material) => (
                <article key={material.id}>
                    <h2>{material.title}</h2>
                    <p>{material.type} · {material.status}</p>
                </article>
            ))}
        </main>
    );
}
```

### Passo 8 - Validar comportamento
- Professor dono da disciplina cria material `TEXT`.
- Material `TEXT` fica `PROCESSED`.
- Material `URL` fica `REFERENCE_ONLY`.
- Professor sem ownership recebe `404`.
- Aluno recebe `403`.
- `BK-MF1-11` usa apenas materiais `PROCESSED`.

## Critérios de aceite
- Não existe campo duplicado para conteúdo.
- `textContent` e `sourceUrl` têm responsabilidades separadas.
- O material guarda `subjectId`, `classId` e `teacherId`.
- `OfficialMaterialsModule` exporta service e schema.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Confirma que um material `URL` não alimenta a IA como texto processado.

## Evidence para PR/defesa
- Screenshot de material `TEXT` criado.
- Screenshot de material `URL` criado.
- Resposta `403` para aluno.
- Diff do schema sem campo genérico duplicado.

## Handoff
`BK-MF1-10` associa voz docente à mesma disciplina. `BK-MF1-11` consulta `OfficialMaterialsService.findProcessedBySubject`.

## Changelog
- 2026-05-30: Guia reescrito com schema sem campo duplicado, módulo exportado e estados de fonte explícitos.
