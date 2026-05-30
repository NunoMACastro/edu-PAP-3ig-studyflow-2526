# BK-MF1-08 - Criar disciplinas e associá-las às turmas.

## Header
- `doc_id`: `GUIA-BK-MF1-08`
- `bk_id`: `BK-MF1-08`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-09`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-08-criar-disciplinas-e-associa-las-as-turmas.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF20`: permitir que o professor crie disciplinas dentro de uma turma sua e liste as disciplinas dessa turma.

## Importância
A disciplina é o contexto oficial para materiais, voz da IA e IA limitada. Se a disciplina não estiver ligada a uma turma validada, os BKs seguintes não conseguem provar que um professor é dono do conteúdo nem que um aluno está autorizado a consultar esse conteúdo.

## Scope-in
- Criar `Subject`.
- Associar disciplina a `SchoolClass`.
- Validar que a turma pertence ao professor autenticado.
- Evitar nomes duplicados dentro da mesma turma.
- Exportar service e schema para BKs seguintes.

## Scope-out
- Catálogo global de disciplinas.
- Vários professores por disciplina.
- Programa curricular completo.
- Materiais oficiais, que entram em `BK-MF1-09`.

## Estado antes
- `BK-MF1-07` criou `SchoolClass`.
- Professor consegue criar turmas.
- Ainda não existe contexto disciplinar oficial.

## Estado depois
- Professor cria disciplinas numa turma sua.
- Professor lista disciplinas por turma.
- Aluno não consegue criar disciplinas.
- Professor de outra turma não recebe dados dessa turma.

## Pré-requisitos
- `ClassesModule` disponível e exportável.
- `SessionGuard` e `AuthenticatedRequest`.
- Validação global de DTOs ativa.

## Glossário
- **Disciplina oficial**: unidade curricular criada por professor dentro de uma turma.
- **Turma dona**: turma onde a disciplina foi criada.
- **Ownership docente**: relação entre professor autenticado e turma/disciplina.

## Conceitos teóricos
Este BK usa validação em cadeia: primeiro confirma o papel `TEACHER`, depois confirma que a turma pertence ao professor, e só então cria ou lista disciplinas. A disciplina guarda também `teacherId` para simplificar consultas posteriores sem perder a ligação à turma.

## Arquitetura do BK
- `apps/api/src/modules/subjects/schemas/subject.schema.ts`
- `apps/api/src/modules/subjects/dto/create-subject.dto.ts`
- `apps/api/src/modules/subjects/subjects.service.ts`
- `apps/api/src/modules/subjects/subjects.controller.ts`
- `apps/api/src/modules/subjects/subjects.module.ts`
- `apps/web/src/lib/api/subjects.ts`
- `apps/web/src/pages/teacher/TeacherSubjectsPage.tsx`

Endpoints:
- `POST /api/teacher/classes/:classId/subjects`
- `GET /api/teacher/classes/:classId/subjects`

## Guia linear de implementação

### Passo 1 - Criar schema da disciplina
Guarda a disciplina com ligação à turma e ao professor.

```ts
// apps/api/src/modules/subjects/schemas/subject.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true, collection: "subjects" })
export class Subject {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 24 })
    code?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true });
SubjectSchema.index({ teacherId: 1, createdAt: -1 });
```

### Passo 2 - Criar DTO
O DTO aceita apenas campos da disciplina. O `classId` vem da rota e o `teacherId` vem da sessão.

```ts
// apps/api/src/modules/subjects/dto/create-subject.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSubjectDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(24)
    code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
```

### Passo 3 - Criar service
O service usa `ClassesService.findOwnedClass` para reaproveitar a regra de ownership criada no BK anterior.

```ts
// apps/api/src/modules/subjects/subjects.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { Subject, SubjectDocument } from "./schemas/subject.schema";

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateSubjectDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const duplicate = await this.subjectModel.exists({
            classId: schoolClass._id,
            name: dto.name.trim(),
        });

        if (duplicate) {
            throw new ConflictException("Já existe uma disciplina com este nome nesta turma.");
        }

        const subject = await this.subjectModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            code: dto.code?.trim().toUpperCase(),
            description: dto.description?.trim(),
        });

        return this.toView(subject);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const subjects = await this.subjectModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ name: 1 })
            .lean();

        return subjects.map((subject) => this.toView(subject));
    }

    async findOwnedSubject(teacherId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findOne({
            _id: new Types.ObjectId(subjectId),
            teacherId: new Types.ObjectId(teacherId),
        });

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada para este professor.");
        }

        return subject;
    }

    async findSubjectForStudent(studentId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findById(subjectId);

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        await this.classesService.ensureStudentEnrollment(studentId, subject.classId.toString());
        return subject;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir disciplinas.");
        }
    }

    private toView(subject: Subject | SubjectDocument) {
        return {
            id: subject._id.toString(),
            classId: subject.classId.toString(),
            teacherId: subject.teacherId.toString(),
            name: subject.name,
            code: subject.code ?? "",
            description: subject.description ?? "",
        };
    }
}
```

### Passo 4 - Criar controller
As rotas ficam dentro de `teacher/classes/:classId` para deixar claro que a disciplina pertence a uma turma.

```ts
// apps/api/src/modules/subjects/subjects.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectsService } from "./subjects.service";

@Controller("api/teacher/classes/:classId/subjects")
@UseGuards(SessionGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateSubjectDto,
    ) {
        return this.subjectsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.subjectsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }
}
```

### Passo 5 - Criar módulo
Exporta `SubjectsService` para materiais, voz docente e IA limitada.

```ts
// apps/api/src/modules/subjects/subjects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { Subject, SubjectSchema } from "./schemas/subject.schema";
import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}
```

### Passo 6 - Criar cliente frontend

```ts
// apps/web/src/lib/api/subjects.ts
export type SubjectView = {
    id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createSubject(
    classId: string,
    input: { name: string; code?: string; description?: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<SubjectView>(response);
}

export async function listSubjects(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/subjects`, {
        credentials: "include",
    });

    return parseResponse<SubjectView[]>(response);
}
```

### Passo 7 - Criar página do professor

```tsx
// apps/web/src/pages/teacher/TeacherSubjectsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { SubjectView, createSubject, listSubjects } from "../../lib/api/subjects";

type Props = {
    classId: string;
};

export function TeacherSubjectsPage({ classId }: Props) {
    const [subjects, setSubjects] = useState<SubjectView[]>([]);
    const [error, setError] = useState("");

    async function refresh() {
        setSubjects(await listSubjects(classId));
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, [classId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            await createSubject(classId, {
                name: String(form.get("name") ?? ""),
                code: String(form.get("code") ?? ""),
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a disciplina.");
        }
    }

    return (
        <main>
            <h1>Disciplinas da turma</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da disciplina" required />
                <input name="code" placeholder="Código curto" />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit">Criar disciplina</button>
            </form>

            {error ? <p role="alert">{error}</p> : null}

            <section>
                {subjects.map((subject) => (
                    <article key={subject.id}>
                        <h2>{subject.name}</h2>
                        <p>{subject.code}</p>
                        <p>{subject.description}</p>
                    </article>
                ))}
            </section>
        </main>
    );
}
```

### Passo 8 - Validar comportamento e integração
Confirma estes cenários:

- Professor cria disciplina numa turma sua.
- Professor de outra turma recebe `404`.
- Aluno recebe `403`.
- Nome duplicado na mesma turma recebe `409`.
- `SubjectsModule` exporta `SubjectsService`.
- `BK-MF1-09`, `BK-MF1-10` e `BK-MF1-11` conseguem localizar disciplina por `subjectId`.

## Critérios de aceite
- A disciplina guarda `classId` e `teacherId`.
- A rota usa `classId` vindo do URL.
- O `teacherId` vem da sessão.
- Não existe criação de disciplina fora de turma.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Regista evidência de criação, listagem, duplicado e professor sem ownership.

## Evidence para PR/defesa
- Screenshot da lista de disciplinas dentro da turma.
- Resposta `409` para disciplina duplicada.
- Resposta `404` para professor sem acesso à turma.
- Diff mostrando `SubjectsModule` exportado.

## Handoff
`BK-MF1-09` deve usar `SubjectsService.findOwnedSubject`. `BK-MF1-11` deve usar `SubjectsService.findSubjectForStudent` para validar inscrição antes de consultar materiais oficiais.

## Changelog
- 2026-05-30: Guia reescrito com módulo completo, ownership por turma e integração explícita para materiais e IA.
