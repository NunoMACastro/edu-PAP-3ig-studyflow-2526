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
**Voz da IA.** A voz define como a IA deve explicar: tom, nível de detalhe e regras pedagógicas. Ela não muda as permissões nem substitui os materiais oficiais.

**Tom.** `tone` controla o estilo geral da explicação. `CALM` pode ser mais paciente, `DIRECT` mais objetivo e `SOCRATIC` mais orientado por perguntas.

**Nível de detalhe.** `detailLevel` controla a extensão da resposta. `SHORT` pede síntese, `BALANCED` mantém equilíbrio e `DETAILED` pede explicação mais completa.

**Regras pedagógicas.** `rules` são instruções curtas do professor, como “usar exemplos do quotidiano” ou “não dar a resposta final sem explicar passos”. O backend remove regras vazias e limita a quantidade para manter o prompt controlado.

**Voz não é fonte.** Mesmo que o professor peça uma resposta detalhada, a IA continua limitada aos materiais oficiais `PROCESSED`. A voz muda forma; as fontes definem conteúdo.

**Decorators do NestJS.** Decorators como `@Controller`, `@Post`, `@Get`, `@Put`, `@Module` e `@Injectable` dizem ao NestJS que papel cada classe tem. O controller recebe pedidos HTTP, o service contém regras de negócio e o módulo liga tudo.

**DTOs e validação.** DTO significa Data Transfer Object. NestJS usa estes objetos, em conjunto com `class-validator`, para validar o que chega do frontend antes de executar regras de negócio.

**Schemas Mongoose.** Um schema Mongoose descreve a forma dos documentos guardados em MongoDB. Campos com `Types.ObjectId` representam ligações entre coleções, como aluno, professor, turma, disciplina ou sala.

**Injeção de dependências.** O constructor dos services recebe models e outros services. Isto evita criar dependências manualmente e torna o código mais fácil de testar.

**React hooks.** `useState` guarda estado local da página, como loading, erro ou resposta. `useEffect` executa carregamentos quando a página abre ou quando um ID muda.

**Fetch API e cookies.** O frontend usa `fetch` para chamar a API. A opção `credentials: 'include'` envia o cookie HttpOnly da sessão, sem expor tokens no JavaScript.

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

Segue estes passos por ordem. Os caminhos indicados representam a estrutura final prevista pelos documentos canónicos: React/TypeScript/Tailwind no frontend, NestJS no backend, MongoDB/Mongoose na persistência e OpenAI API apenas atrás de provider isolado quando houver IA. Não alteres IDs BK, RF/RNF, owners, prioridades, sprints ou dependências.

O código abaixo deve ser tratado como código final previsto, não como exemplo solto. Quando um passo usa dados do aluno ou do professor, o ownership vem sempre da sessão. Quando um passo usa IA ou materiais, a geração deve bloquear se não existirem fontes processáveis e autorizadas.

### Pré-requisitos concretos

- `BK-MF1-08` com `SubjectsService.findOwnedSubject`.
- `SessionGuard`.
- Validação global de DTOs.

### Passo 1 - Criar schema

1. Explicação simples do objetivo.

    Neste passo vais criar schema nos ficheiros `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/schemas/teacher-ai-voice.schema.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type TeacherAiVoiceDocument = HydratedDocument<TeacherAiVoice>;
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type TeacherAiTone = "CALM" | "DIRECT" | "SOCRATIC";
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type TeacherAiDetailLevel = "SHORT" | "BALANCED" | "DETAILED";

// Comentário pedagógico: @Schema transforma a classe num modelo persistido pelo Mongoose.
@Schema({ timestamps: true, collection: "teacher_ai_voices" })
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class TeacherAiVoice {
    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, unique: true, index: true })
    subjectId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"], default: "CALM" })
    tone!: TeacherAiTone;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ required: true, enum: ["SHORT", "BALANCED", "DETAILED"], default: "BALANCED" })
    detailLevel!: TeacherAiDetailLevel;

    // Comentário pedagógico: @Prop define um campo guardado no documento MongoDB.
    @Prop({ type: [String], default: [] })
    rules!: string[];
}

export const TeacherAiVoiceSchema = SchemaFactory.createForClass(TeacherAiVoice);
TeacherAiVoiceSchema.index({ teacherId: 1, subjectId: 1 });
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 2 - Criar DTO

1. Explicação simples do objetivo.

    Neste passo vais criar dto nos ficheiros `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 3 - Criar service

1. Explicação simples do objetivo.

    Neste passo vais criar service nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoice, TeacherAiVoiceDocument } from "./schemas/teacher-ai-voice.schema";

@Injectable()
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class TeacherAiVoiceService {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
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

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    async getForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const voice = await this.voiceModel.findOne({ subjectId: subject._id });
        return voice ? this.toView(voice) : this.defaultVoice(subject);
    }

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
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
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
        if (actor.role !== "TEACHER") {
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 4 - Criar controller com método PUT

1. Explicação simples do objetivo.

    Neste passo vais criar controller com método put nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class TeacherAiVoiceController {
    // Comentário pedagógico: o constructor recebe dependências por injeção do NestJS.
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

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 5 - Criar módulo

1. Explicação simples do objetivo.

    Neste passo vais criar módulo nos ficheiros `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/api/src/modules/teacher-ai/teacher-ai.module.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/teacher-ai/teacher-ai.module.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
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
// Comentário pedagógico: a classe exportada é a peça principal deste ficheiro.
export class TeacherAiModule {}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 6 - Criar cliente frontend com PUT

1. Explicação simples do objetivo.

    Neste passo vais criar cliente frontend com put nos ficheiros `apps/web/src/lib/api/teacherAiVoice.ts`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/lib/api/teacherAiVoice.ts`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/teacherAiVoice.ts
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
// Comentário pedagógico: este type dá nome TypeScript à estrutura usada noutros ficheiros.
export type TeacherAiVoiceView = {
    id: string;
    subjectId: string;
    teacherId: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
async function parseResponse<T>(response: Response): Promise<T> {
        // Comentário pedagógico: esta validação bloqueia dados inválidos ou acesso sem permissão.
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido inválido." }));
            // Comentário pedagógico: esta exceção devolve um erro controlado ao cliente.
        throw new Error(error.message ?? "Pedido inválido.");
    }

    return response.json() as Promise<T>;
}

export async function updateTeacherAiVoice(
    subjectId: string,
    input: Pick<TeacherAiVoiceView, "tone" | "detailLevel" | "rules">,
) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    return parseResponse<TeacherAiVoiceView>(response);
}

export async function getTeacherAiVoice(subjectId: string) {
    // Comentário pedagógico: fetch chama a API; credentials envia o cookie HttpOnly da sessão.
    const response = await fetch(`/api/teacher/subjects/${subjectId}/ai-voice`, {
        credentials: "include",
    });

    return parseResponse<TeacherAiVoiceView>(response);
}
```

5. Explicação do código.

    Confirma que a peça criada neste passo está ligada ao fluxo principal do BK.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

### Passo 7 - Criar página do professor

1. Explicação simples do objetivo.

    Neste passo vais criar página do professor nos ficheiros `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`. O objetivo é avançar uma peça pequena, verificável e ligada ao que os BKs anteriores já criaram, para evitar código solto ou contratos contraditórios.

2. Ficheiros envolvidos.

- CRIAR: `apps/web/src/pages/teacher/TeacherAiVoicePage.tsx`
- LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados acima, exatamente na localização indicada. Usa o código completo abaixo como a versão final prevista para a app, mantendo nomes, exports e imports coerentes com os BKs anteriores e seguintes.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/teacher/TeacherAiVoicePage.tsx
// Comentário pedagógico: este comentário identifica o ficheiro exacto onde este bloco deve ser colocado.
import { FormEvent, useEffect, useState } from "react";
import {
    TeacherAiVoiceView,
    getTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/api/teacherAiVoice";

type Props = {
    subjectId: string;
};

// Comentário pedagógico: esta função isola uma transformação para o service não ficar sobrecarregado.
export function TeacherAiVoicePage({ subjectId }: Props) {
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [voice, setVoice] = useState<TeacherAiVoiceView | null>(null);
    // Comentário pedagógico: useState guarda estado local que altera a interface.
    const [error, setError] = useState("");

    // Comentário pedagógico: useEffect carrega dados quando a página abre ou quando um ID muda.
    useEffect(() => {
        getTeacherAiVoice(subjectId)
            .then(setVoice)
            .catch((reason: Error) => setError(reason.message));
    }, [subjectId]);

    // Comentário pedagógico: este método é assíncrono porque consulta BD, API ou outro service.
    // Comentário pedagógico: esta função trata o formulário sem recarregar a página.
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

    // Comentário pedagógico: o JSX abaixo define o que aparece no browser.
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

    - O frontend usa `PUT`, tal como o controller.
- Professor cria configuração na primeira gravação.
- Segunda gravação atualiza a mesma configuração.
- Regras vazias são removidas.
- Aluno recebe `403`.
- Professor sem ownership recebe `404`.

6. Como validar este passo.

    Confirma que os ficheiros indicados existem, que os imports apontam para módulos reais da estrutura prevista e que o comportamento deste passo é coberto na validação final do BK. Quando o passo usa dados de aluno, professor, turma, sala ou disciplina, valida sempre com sessão real e nunca com IDs enviados livremente no body.

7. Erros comuns ou cenário negativo.

    O erro mais comum é copiar o código sem respeitar a ordem dos BKs: isso cria imports para ficheiros ainda não definidos. Outro erro é quebrar ownership, aceitando IDs vindos do frontend em vez de usar a sessão autenticada ou os services de validação.

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
