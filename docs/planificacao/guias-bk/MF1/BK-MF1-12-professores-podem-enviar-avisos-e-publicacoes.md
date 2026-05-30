# BK-MF1-12 - Professores podem enviar avisos e publicações.

## Header
- `doc_id`: `GUIA-BK-MF1-12`
- `bk_id`: `BK-MF1-12`
- `macro`: `MF1`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF24`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-12-professores-podem-enviar-avisos-e-publicacoes.md`
- `last_updated`: `2026-05-30`

## Objetivo
Implementar `RF24`: permitir que professores publiquem avisos e publicações numa turma, e que alunos inscritos os consultem.

## Importância
Publicações docentes são comunicação oficial. A leitura por alunos tem de usar a inscrição real da turma, não uma rota pública nem um `classId` sem validação.

## Scope-in
- Criar `ClassPost`.
- Criar aviso ou publicação.
- Listar publicações para professor dono da turma.
- Listar publicações para aluno inscrito.
- Separar cliente frontend de criação e cliente de leitura do aluno.

## Scope-out
- Notificações push.
- Comentários e reações.
- Anexos.
- Agendamento de publicações.

## Estado antes
- `BK-MF1-07` criou turmas e inscrição por aluno.
- Ainda não existe canal oficial de avisos.

## Estado depois
- Professor cria publicações.
- Professor lista publicações da sua turma.
- Aluno inscrito lista publicações da turma.
- Aluno não inscrito recebe erro.

## Pré-requisitos
- `ClassesService.findOwnedClass`.
- `ClassesService.ensureStudentEnrollment`.
- `SessionGuard`.

## Glossário
- **Aviso**: mensagem curta e importante.
- **Publicação**: conteúdo informativo mais geral.
- **Autor**: professor autenticado que criou o conteúdo.

## Conceitos teóricos
A escrita e a leitura têm regras diferentes. O professor escreve se for dono da turma. O aluno lê se estiver em `studentIds`. Separar estas regras no service evita exposição acidental de informação.

## Arquitetura do BK
- `apps/api/src/modules/class-posts/schemas/class-post.schema.ts`
- `apps/api/src/modules/class-posts/dto/create-class-post.dto.ts`
- `apps/api/src/modules/class-posts/class-posts.service.ts`
- `apps/api/src/modules/class-posts/class-posts.controller.ts`
- `apps/api/src/modules/class-posts/class-posts.module.ts`
- `apps/web/src/lib/api/classPosts.ts`
- `apps/web/src/pages/teacher/TeacherClassPostsPage.tsx`
- `apps/web/src/pages/student/StudentClassPostsPage.tsx`

Endpoints:
- `POST /api/teacher/classes/:classId/posts`
- `GET /api/teacher/classes/:classId/posts`
- `GET /api/student/classes/:classId/posts`

## Guia linear de implementação

### Passo 1 - Criar schema

```ts
// apps/api/src/modules/class-posts/schemas/class-post.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassPostDocument = HydratedDocument<ClassPost>;
export type ClassPostType = "NOTICE" | "POST";

@Schema({ timestamps: true, collection: "class_posts" })
export class ClassPost {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTICE", "POST"] })
    type!: ClassPostType;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 4000 })
    body!: string;
}

export const ClassPostSchema = SchemaFactory.createForClass(ClassPost);
ClassPostSchema.index({ classId: 1, createdAt: -1 });
```

### Passo 2 - Criar DTO

```ts
// apps/api/src/modules/class-posts/dto/create-class-post.dto.ts
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassPostDto {
    @IsIn(["NOTICE", "POST"])
    type!: "NOTICE" | "POST";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(4000)
    body!: string;
}
```

### Passo 3 - Criar service

```ts
// apps/api/src/modules/class-posts/class-posts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";
import { ClassPost, ClassPostDocument } from "./schemas/class-post.schema";

@Injectable()
export class ClassPostsService {
    constructor(
        @InjectModel(ClassPost.name)
        private readonly postModel: Model<ClassPostDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateClassPostDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const post = await this.postModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            body: dto.body.trim(),
        });

        return this.toView(post);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    async listForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem criar publicações.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos inscritos podem ler publicações.");
        }
    }

    private toView(post: ClassPost | ClassPostDocument) {
        return {
            id: post._id.toString(),
            classId: post.classId.toString(),
            teacherId: post.teacherId.toString(),
            type: post.type,
            title: post.title,
            body: post.body,
        };
    }
}
```

### Passo 4 - Criar controller

```ts
// apps/api/src/modules/class-posts/class-posts.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassPostsService } from "./class-posts.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";

@Controller("api")
@UseGuards(SessionGuard)
export class ClassPostsController {
    constructor(private readonly classPostsService: ClassPostsService) {}

    @Post("teacher/classes/:classId/posts")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateClassPostDto,
    ) {
        return this.classPostsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get("teacher/classes/:classId/posts")
    listForTeacher(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }

    @Get("student/classes/:classId/posts")
    listForStudent(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForStudent(request.user as AuthenticatedUser, classId);
    }
}
```

### Passo 5 - Criar módulo

```ts
// apps/api/src/modules/class-posts/class-posts.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { ClassPostsController } from "./class-posts.controller";
import { ClassPostsService } from "./class-posts.service";
import { ClassPost, ClassPostSchema } from "./schemas/class-post.schema";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: ClassPost.name, schema: ClassPostSchema }]),
    ],
    controllers: [ClassPostsController],
    providers: [ClassPostsService],
})
export class ClassPostsModule {}
```

### Passo 6 - Criar cliente frontend

```ts
// apps/web/src/lib/api/classPosts.ts
export type ClassPostView = {
    id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string;
    body: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function createClassPost(
    classId: string,
    input: { type: "NOTICE" | "POST"; title: string; body: string },
) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<ClassPostView>(response);
}

export async function listTeacherClassPosts(classId: string) {
    const response = await fetch(`/api/teacher/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}

export async function listClassPostsForStudent(classId: string) {
    const response = await fetch(`/api/student/classes/${classId}/posts`, {
        credentials: "include",
    });

    return parseResponse<ClassPostView[]>(response);
}
```

### Passo 7 - Criar página do professor

```tsx
// apps/web/src/pages/teacher/TeacherClassPostsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import {
    ClassPostView,
    createClassPost,
    listTeacherClassPosts,
} from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function TeacherClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");

    async function refresh() {
        setPosts(await listTeacherClassPosts(classId));
    }

    useEffect(() => {
        refresh().catch((reason: Error) => setError(reason.message));
    }, [classId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const form = new FormData(event.currentTarget);

        try {
            await createClassPost(classId, {
                type: String(form.get("type") ?? "NOTICE") as "NOTICE" | "POST",
                title: String(form.get("title") ?? ""),
                body: String(form.get("body") ?? ""),
            });
            event.currentTarget.reset();
            await refresh();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Não foi possível publicar.");
        }
    }

    return (
        <main>
            <h1>Publicações da turma</h1>
            <form onSubmit={handleSubmit}>
                <select name="type">
                    <option value="NOTICE">Aviso</option>
                    <option value="POST">Publicação</option>
                </select>
                <input name="title" placeholder="Título" required />
                <textarea name="body" required />
                <button type="submit">Publicar</button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {posts.map((post) => (
                <article key={post.id}>
                    <strong>{post.type}</strong>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                </article>
            ))}
        </main>
    );
}
```

### Passo 8 - Criar página do aluno e validar

```tsx
// apps/web/src/pages/student/StudentClassPostsPage.tsx
import { useEffect, useState } from "react";
import { ClassPostView, listClassPostsForStudent } from "../../lib/api/classPosts";

type Props = {
    classId: string;
};

export function StudentClassPostsPage({ classId }: Props) {
    const [posts, setPosts] = useState<ClassPostView[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        listClassPostsForStudent(classId)
            .then(setPosts)
            .catch((reason: Error) => setError(reason.message));
    }, [classId]);

    return (
        <main>
            <h1>Avisos e publicações</h1>
            {error ? <p role="alert">{error}</p> : null}
            {posts.map((post) => (
                <article key={post.id}>
                    <strong>{post.type}</strong>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                </article>
            ))}
        </main>
    );
}
```

Valida:
- Professor dono cria publicação.
- Professor sem ownership recebe `404`.
- Aluno inscrito lê publicações.
- Aluno não inscrito recebe `403`.
- Aluno não consegue criar publicação.

## Critérios de aceite
- Escrita exige professor dono da turma.
- Leitura de aluno exige inscrição.
- `ClassPost` guarda `classId`, `teacherId`, `type`, `title` e `body`.
- Frontend separa criação docente e leitura do aluno.
- Chamadas usam `credentials: 'include'`.

## Validação final
Executa:

```bash
npm run test:unit
npm run test:integration
```

Testa cruzamento entre duas turmas para garantir que publicações não vazam.

## Evidence para PR/defesa
- Screenshot de aviso criado por professor.
- Screenshot de aluno inscrito a ler o aviso.
- Resposta `403` para aluno não inscrito.
- Resposta `403` para aluno a tentar criar publicação.

## Handoff
`BK-MF2-01` pode partir de uma turma com comunicação oficial funcional e acesso por aluno inscrito.

## Changelog
- 2026-05-30: Guia reescrito com leitura protegida por inscrição e clientes frontend separados.
