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
**Turma como fronteira oficial.** Uma turma representa um grupo formal criado por um professor. Ao contrário de uma sala de estudo, que é colaborativa entre alunos, a turma é o ponto de partida para disciplinas, materiais oficiais, IA docente e publicações.

**Ownership docente.** `teacherId` identifica o professor dono da turma. Este valor vem da sessão autenticada, não do body. Se o frontend pudesse enviar `teacherId`, qualquer utilizador poderia tentar criar turmas em nome de outro professor.

**Inscrição de alunos.** `studentIds` guarda os IDs dos alunos que pertencem à turma. Esta lista é usada mais tarde para controlar quem pode ler publicações e usar a IA limitada da disciplina.

**Associação por email.** O professor escreve o email do aluno, o backend procura esse utilizador e adiciona o seu `_id` a `studentIds`. O email é apenas uma forma humana de encontrar o aluno; a autorização final usa o ID persistido.

**Decisão derivada.** `RF19` fala em criar turmas, mas `RF23` e `RF24` dependem de alunos inscritos. Por isso, este BK acrescenta o fluxo mínimo de inscrição para a cadeia seguinte ficar demonstrável sem mexer manualmente na base de dados.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

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

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF0-01` com `User`.
- `BK-MF0-02` com `SessionGuard` e `AuthenticatedRequest`.
- Mongoose configurado no backend.
- Frontend a chamar endpoints privados com `credentials: 'include'`.

### Passo 1 - Criar schema da turma

1. Explicação simples do objetivo.

    Neste passo vais criar schema da turma nos ficheiros `apps/api/src/modules/classes/schemas/school-class.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/classes/schemas/school-class.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    Cria a entidade persistente usada por todos os BKs docentes seguintes.

Valida que o índice único é por professor. Dois professores podem usar o mesmo código, mas o mesmo professor não deve duplicar a turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTOs de entrada

1. Explicação simples do objetivo.

    Neste passo vais criar dtos de entrada nos ficheiros `apps/api/src/modules/classes/dto/create-class.dto.ts`, `apps/api/src/modules/classes/dto/add-class-student.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/classes/dto/create-class.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/api/src/modules/classes/dto/add-class-student.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    Os DTOs limitam campos aceites e impedem que o cliente envie ownership.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service com regras de segurança

1. Explicação simples do objetivo.

    Neste passo vais criar service com regras de segurança nos ficheiros `apps/api/src/modules/classes/classes.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/classes/classes.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    O service valida papel, ownership e existência do aluno. Não aceita `teacherId` nem `studentIds` vindos do cliente.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller

1. Explicação simples do objetivo.

    Neste passo vais criar controller nos ficheiros `apps/api/src/modules/classes/classes.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/classes/classes.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    O controller expõe rotas separadas para professor e aluno, mantendo o mesmo service.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/classes/classes.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/classes/classes.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    O módulo exporta `ClassesService` para os BKs de disciplinas, IA limitada e publicações.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend nos ficheiros `apps/web/src/lib/api/classes.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/classes.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    O cliente centraliza as chamadas e envia sempre o cookie de sessão.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar páginas mínimas de utilização

1. Explicação simples do objetivo.

    Neste passo vais criar páginas mínimas de utilização nos ficheiros `apps/web/src/pages/teacher/TeacherClassesPage.tsx`, `apps/web/src/pages/student/StudentClassesPage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherClassesPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.
- CRIAR: `apps/web/src/pages/student/StudentClassesPage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

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

5. Explicação do código.

    A página do professor deve permitir criar turma, ver lista e adicionar aluno por email.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 8 - Validar comportamento e integração

1. Explicação simples do objetivo.

    Neste passo vais validar comportamento e integração no fluxo de validação do BK. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- VALIDAR: este passo não cria ficheiros novos.
- LOCALIZAÇÃO: executa os cenários indicados neste passo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

Não há código novo neste passo. Usa-o para confirmar que os passos anteriores funcionam em conjunto.

5. Explicação do código.

    Valida estes cenários:

- Professor cria turma com `name`, `code` e `schoolYear`.
- Professor não consegue duplicar `code` dentro das suas turmas.
- Aluno recebe `403` ao tentar criar turma.
- Professor adiciona aluno existente por email.
- Aluno inscrito vê a turma em `GET /api/student/classes`.
- Aluno não inscrito não vê a turma.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

## Expected results
- `POST /api/teacher/classes` com professor autenticado devolve `201` com `teacherId` vindo da sessão.
- `POST /api/teacher/classes` com aluno autenticado devolve `403`.
- Criação duplicada de `code` dentro das turmas do mesmo professor devolve `409`.
- `POST /api/teacher/classes/:classId/students` adiciona aluno existente por email e devolve a turma atualizada.
- `GET /api/student/classes` devolve `200` apenas com turmas onde o aluno autenticado está em `studentIds`.

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
