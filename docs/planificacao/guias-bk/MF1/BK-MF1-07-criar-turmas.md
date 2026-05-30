# BK-MF1-07 - Criar turmas.

## Header
- `doc_id`: `GUIA-BK-MF1-07`
- `bk_id`: `BK-MF1-07`
- `macro`: `MF1`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF19`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-08`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-07-criar-turmas.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF19`: permitir que um professor crie turmas oficiais e consulte apenas as suas turmas. Este BK também acrescenta, como decisão `DERIVADO`, o fluxo mínimo para associar alunos por email, porque `RF23`, `RF24` e os BKs seguintes dependem de existir um aluno inscrito numa turma.

## Importância
Turmas são a fronteira principal da área docente. Disciplinas, materiais oficiais, voz da IA, IA limitada e publicações usam a turma para saber quem é o professor responsável e que alunos podem consultar conteúdo. Por isso, a turma não pode depender de um `teacherId` enviado pelo browser.

## Scope-in
- Criar `SchoolClass`.
- Listar turmas do professor autenticado.
- Adicionar aluno existente à turma por email.
- Listar turmas do aluno autenticado.
- Garantir que ownership e inscrição vêm da sessão e da base de dados.

## Scope-out
- Importação CSV.
- Horários, avaliações e sumários.
- Convites por email com token.
- Gestão avançada de vários professores na mesma turma.

## Estado antes
- Existe autenticação com cookie HttpOnly e `SessionGuard`.
- Existem utilizadores com `role` `TEACHER` ou `STUDENT`.
- Não existe fronteira persistente para turmas oficiais.

## Estado depois
- `SchoolClass` guarda professor, código, ano letivo e alunos.
- Professor cria e lista as suas turmas.
- Professor associa um aluno existente à turma.
- Aluno lista apenas turmas onde está inscrito.

## Pré-requisitos
- `BK-MF0-01` com `User`.
- `BK-MF0-02` com `SessionGuard` e `AuthenticatedRequest`.
- Mongoose configurado no backend.
- Frontend a chamar endpoints privados com `credentials: 'include'`.

## Glossário
- **Turma oficial**: grupo criado por um professor para organizar disciplinas e alunos.
- **Professor dono**: utilizador autenticado que criou a turma.
- **Aluno inscrito**: aluno cujo `_id` está em `studentIds`.
- **Decisão DERIVADO**: detalhe técnico não escrito literalmente em `RF19`, mas necessário para cumprir RFs seguintes sem inventar dados.

## Conceitos teóricos
O backend é a autoridade de segurança. O frontend pode mostrar ou esconder botões, mas o service tem sempre de validar a sessão, o papel do utilizador e o ownership da turma.

A inscrição por email é uma decisão pequena e verificável. Não cria utilizadores, não envia convite externo e não altera permissões globais: apenas associa um aluno já existente a uma turma do professor autenticado.

## Arquitetura do BK
- `apps/api/src/modules/classes/schemas/school-class.schema.ts`
- `apps/api/src/modules/classes/dto/create-class.dto.ts`
- `apps/api/src/modules/classes/dto/add-class-student.dto.ts`
- `apps/api/src/modules/classes/classes.service.ts`
- `apps/api/src/modules/classes/classes.controller.ts`
- `apps/api/src/modules/classes/classes.module.ts`
- `apps/web/src/lib/api/classes.ts`
- `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- `apps/web/src/pages/student/StudentClassesPage.tsx`

Endpoints:
- `POST /api/teacher/classes`
- `GET /api/teacher/classes`
- `POST /api/teacher/classes/:classId/students`
- `GET /api/student/classes`

## Guia linear de implementação

### Passo 1 - Criar schema da turma
Cria a entidade persistente usada por todos os BKs docentes seguintes.

```ts
// apps/api/src/modules/classes/schemas/school-class.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SchoolClassDocument = HydratedDocument<SchoolClass>;

@Schema({ timestamps: true, collection: "school_classes" })
export class SchoolClass {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, trim: true, uppercase: true, minlength: 2, maxlength: 24 })
    code!: string;

    @Prop({ required: true, trim: true, minlength: 4, maxlength: 20 })
    schoolYear!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    studentIds!: Types.ObjectId[];
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
SchoolClassSchema.index({ teacherId: 1, code: 1 }, { unique: true });
SchoolClassSchema.index({ studentIds: 1, createdAt: -1 });
```

Valida que o índice único é por professor. Dois professores podem usar o mesmo código, mas o mesmo professor não deve duplicar a turma.

### Passo 2 - Criar DTOs de entrada
Os DTOs limitam campos aceites e impedem que o cliente envie ownership.

```ts
// apps/api/src/modules/classes/dto/create-class.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(24)
    code!: string;

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    schoolYear!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
```

```ts
// apps/api/src/modules/classes/dto/add-class-student.dto.ts
import { IsEmail } from "class-validator";

export class AddClassStudentDto {
    @IsEmail()
    email!: string;
}
```

### Passo 3 - Criar service com regras de segurança
O service valida papel, ownership e existência do aluno. Não aceita `teacherId` nem `studentIds` vindos do cliente.

```ts
// apps/api/src/modules/classes/classes.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { User, UserDocument } from "../auth/schemas/user.schema";
import { AddClassStudentDto } from "./dto/add-class-student.dto";
import { CreateClassDto } from "./dto/create-class.dto";
import { SchoolClass, SchoolClassDocument } from "./schemas/school-class.schema";

@Injectable()
export class ClassesService {
    constructor(
        @InjectModel(SchoolClass.name)
        private readonly classModel: Model<SchoolClassDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async create(actor: AuthenticatedUser, dto: CreateClassDto) {
        this.assertTeacher(actor);

        const code = dto.code.trim().toUpperCase();
        const duplicate = await this.classModel.exists({
            teacherId: new Types.ObjectId(actor.id),
            code,
        });

        if (duplicate) {
            throw new ConflictException("Já existe uma turma com este código.");
        }

        const schoolClass = await this.classModel.create({
            teacherId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            code,
            schoolYear: dto.schoolYear.trim(),
            description: dto.description?.trim(),
            studentIds: [],
        });

        return this.toView(schoolClass);
    }

    async listForTeacher(actor: AuthenticatedUser) {
        this.assertTeacher(actor);

        const classes = await this.classModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return classes.map((schoolClass) => this.toView(schoolClass));
    }

    async addStudent(actor: AuthenticatedUser, classId: string, dto: AddClassStudentDto) {
        this.assertTeacher(actor);

        const schoolClass = await this.findOwnedClass(actor.id, classId);
        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        if (!student) {
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const alreadyEnrolled = schoolClass.studentIds.some((id) => id.equals(studentId));

        if (!alreadyEnrolled) {
            schoolClass.studentIds.push(studentId);
            await schoolClass.save();
        }

        return this.toView(schoolClass);
    }

    async listForStudent(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const classes = await this.classModel
            .find({ studentIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return classes.map((schoolClass) => this.toView(schoolClass));
    }

    async findOwnedClass(teacherId: string, classId: string) {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Turma não encontrada.");
        }

        const schoolClass = await this.classModel.findOne({
            _id: new Types.ObjectId(classId),
            teacherId: new Types.ObjectId(teacherId),
        });

        if (!schoolClass) {
            throw new NotFoundException("Turma não encontrada para este professor.");
        }

        return schoolClass;
    }

    async ensureStudentEnrollment(studentId: string, classId: string) {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Turma não encontrada.");
        }

        const schoolClass = await this.classModel.findOne({
            _id: new Types.ObjectId(classId),
            studentIds: new Types.ObjectId(studentId),
        });

        if (!schoolClass) {
            throw new ForbiddenException("Aluno sem inscrição nesta turma.");
        }

        return schoolClass;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir turmas.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar as suas turmas.");
        }
    }

    private toView(schoolClass: SchoolClass | SchoolClassDocument) {
        return {
            id: schoolClass._id.toString(),
            teacherId: schoolClass.teacherId.toString(),
            name: schoolClass.name,
            code: schoolClass.code,
            schoolYear: schoolClass.schoolYear,
            description: schoolClass.description ?? "",
            studentIds: schoolClass.studentIds.map((id) => id.toString()),
        };
    }
}
```

### Passo 4 - Criar controller
O controller expõe rotas separadas para professor e aluno, mantendo o mesmo service.

```ts
// apps/api/src/modules/classes/classes.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassesService } from "./classes.service";
import { AddClassStudentDto } from "./dto/add-class-student.dto";
import { CreateClassDto } from "./dto/create-class.dto";

@Controller("api")
@UseGuards(SessionGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) {}

    @Post("teacher/classes")
    create(@Req() request: AuthenticatedRequest, @Body() dto: CreateClassDto) {
        return this.classesService.create(request.user as AuthenticatedUser, dto);
    }

    @Get("teacher/classes")
    listForTeacher(@Req() request: AuthenticatedRequest) {
        return this.classesService.listForTeacher(request.user as AuthenticatedUser);
    }

    @Post("teacher/classes/:classId/students")
    addStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: AddClassStudentDto,
    ) {
        return this.classesService.addStudent(request.user as AuthenticatedUser, classId, dto);
    }

    @Get("student/classes")
    listForStudent(@Req() request: AuthenticatedRequest) {
        return this.classesService.listForStudent(request.user as AuthenticatedUser);
    }
}
```

### Passo 5 - Criar módulo
O módulo exporta `ClassesService` para os BKs de disciplinas, IA limitada e publicações.

```ts
// apps/api/src/modules/classes/classes.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { SchoolClass, SchoolClassSchema } from "./schemas/school-class.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SchoolClass.name, schema: SchoolClassSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService, MongooseModule],
})
export class ClassesModule {}
```

### Passo 6 - Criar cliente frontend
O cliente centraliza as chamadas e envia sempre o cookie de sessão.

```ts
// apps/web/src/lib/api/classes.ts
export type SchoolClassView = {
    id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    description: string;
    studentIds: string[];
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createClass(input: {
    name: string;
    code: string;
    schoolYear: string;
    description?: string;
}) {
    const response = await fetch("/api/teacher/classes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<SchoolClassView>(response);
}

export async function listTeacherClasses() {
    const response = await fetch("/api/teacher/classes", {
        credentials: "include",
    });

    return parseResponse<SchoolClassView[]>(response);
}

export async function addClassStudent(classId: string, email: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    return parseResponse<SchoolClassView>(response);
}

export async function listStudentClasses() {
    const response = await fetch("/api/student/classes", {
        credentials: "include",
    });

    return parseResponse<SchoolClassView[]>(response);
}
```

### Passo 7 - Criar páginas mínimas de utilização
A página do professor deve permitir criar turma, ver lista e adicionar aluno por email.

```tsx
// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    SchoolClassView,
    addClassStudent,
    createClass,
    listTeacherClasses,
} from "../../lib/api/classes";

export function TeacherClassesPage() {
    const [classes, setClasses] = useState<SchoolClassView[]>([]);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function refresh() {
        setClasses(await listTeacherClasses());
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, []);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            await createClass({
                name: String(form.get("name") ?? ""),
                code: String(form.get("code") ?? ""),
                schoolYear: String(form.get("schoolYear") ?? ""),
                description: String(form.get("description") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível criar a turma.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAddStudent(classId: string, email: string) {
        setError("");
        await addClassStudent(classId, email);
        await refresh();
    }

    return (
        <main>
            <h1>Turmas</h1>
            <form onSubmit={handleCreate}>
                <input name="name" placeholder="Nome da turma" required />
                <input name="code" placeholder="Código" required />
                <input name="schoolYear" placeholder="Ano letivo" required />
                <textarea name="description" placeholder="Descrição" />
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "A guardar" : "Criar turma"}
                </button>
            </form>

            {error ? <p role="alert">{error}</p> : null}

            <section>
                {classes.map((schoolClass) => (
                    <article key={schoolClass.id}>
                        <h2>{schoolClass.name}</h2>
                        <p>{schoolClass.code} · {schoolClass.schoolYear}</p>
                        <p>{schoolClass.studentIds.length} alunos inscritos</p>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const form = new FormData(event.currentTarget);
                                handleAddStudent(schoolClass.id, String(form.get("email") ?? "")).catch(
                                    (reason: Error) => setError(reason.message),
                                );
                                event.currentTarget.reset();
                            }}
                        >
                            <input name="email" type="email" placeholder="Email do aluno" required />
                            <button type="submit">Adicionar aluno</button>
                        </form>
                    </article>
                ))}
            </section>
        </main>
    );
}
```

```tsx
// apps/web/src/pages/student/StudentClassesPage.tsx
import { useEffect, useState } from "react";
import { SchoolClassView, listStudentClasses } from "../../lib/api/classes";

export function StudentClassesPage() {
    const [classes, setClasses] = useState<SchoolClassView[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        listStudentClasses()
            .then(setClasses)
            .catch((reason: Error) => setError(reason.message));
    }, []);

    return (
        <main>
            <h1>As minhas turmas</h1>
            {error ? <p role="alert">{error}</p> : null}
            {classes.length === 0 ? <p>Ainda não estás inscrito em turmas.</p> : null}
            {classes.map((schoolClass) => (
                <article key={schoolClass.id}>
                    <h2>{schoolClass.name}</h2>
                    <p>{schoolClass.code} · {schoolClass.schoolYear}</p>
                </article>
            ))}
        </main>
    );
}
```

### Passo 8 - Validar comportamento e integração
Valida estes cenários:

- Professor cria turma com `name`, `code` e `schoolYear`.
- Professor não consegue duplicar `code` dentro das suas turmas.
- Aluno recebe `403` ao tentar criar turma.
- Professor adiciona aluno existente por email.
- Aluno inscrito vê a turma em `GET /api/student/classes`.
- Aluno não inscrito não vê a turma.

## Critérios de aceite
- `SchoolClass` existe com `teacherId`, `name`, `code`, `schoolYear` e `studentIds`.
- O `teacherId` vem sempre da sessão.
- A associação de aluno usa email de utilizador existente com `role` `STUDENT`.
- `ClassesModule` exporta `ClassesService` para BKs seguintes.
- Frontend usa `credentials: 'include'`.

## Validação final
Executa validações manuais e automatizadas relevantes:

```bash
npm run test:unit
npm run test:integration
```

Confirma também que `BK-MF1-08`, `BK-MF1-11` e `BK-MF1-12` conseguem depender de `SchoolClass.studentIds`.

## Evidence para PR/defesa
- Screenshot da criação de turma.
- Screenshot da associação de aluno.
- Resposta `403` para aluno a tentar criar turma.
- Registo de turma com `studentIds` preenchido.

## Handoff
O próximo BK (`BK-MF1-08`) deve usar `SchoolClass.teacherId` para confirmar que a disciplina pertence ao professor autenticado. `BK-MF1-11` e `BK-MF1-12` devem usar `studentIds` para proteger a leitura por alunos.

## Changelog
- 2026-05-30: Guia reescrito para fechar módulo, endpoints, cliente frontend e fluxo derivado de inscrição de alunos.
