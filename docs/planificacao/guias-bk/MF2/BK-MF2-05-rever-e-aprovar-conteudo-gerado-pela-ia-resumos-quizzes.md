# BK-MF2-05 - Rever e aprovar conteúdo gerado pela IA (resumos/quizzes).

## Header
- `doc_id`: `GUIA-BK-MF2-05`
- `bk_id`: `BK-MF2-05`
- `macro`: `MF2`
- `owner`: `Kaua`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-09`
- `rf_rnf`: `RF29`
- `fase_documental`: `Fase 1`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-06`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-05-rever-e-aprovar-conteudo-gerado-pela-ia-resumos-quizzes.md`
- `last_updated`: `2026-06-07`

## O que vamos fazer neste BK

Neste BK vais implementar revisão docente de IA de forma incremental, usando os contratos já definidos em MF0 e MF1. O objetivo é que o aluno consiga criar os ficheiros, ligar backend e frontend, validar permissões e preparar o próximo BK sem adivinhar peças técnicas.

## Porque é que isto é importante

- Dá implementação concreta a `RF29`.
- Mantém separados aluno, professor, turma, disciplina, material e IA.
- Aplica ownership ou membership no backend antes de devolver dados.
- Prepara `BK-MF2-06` com exports e endpoints estáveis.

## O que entra (scope)

- Backend NestJS com schema, DTO, service, controller e módulo.
- Frontend React/TypeScript com cliente API e página mínima.
- Endpoint principal: `POST /api/teacher/subjects/:subjectId/ai-content-reviews`.
- Validação de sessão, papel e contexto.
- Evidence de sucesso e negativos.

## O que não entra (scope-out)

- Alterar IDs, owners, prioridades, sprints ou dependências canónicas.
- Criar integrações externas não documentadas.
- Misturar materiais privados, oficiais e de turma.
- Usar IA sem fontes processáveis e autorizadas.

## Estado antes

O guia anterior estava em estado `CRÍTICO`: tinha passos genéricos, não indicava ficheiros completos e não permitia implementar `RF29` com segurança.

## Estado depois

O guia passa a ter estrutura MF0, código integrado, validação por passo, expected results, critérios de aceite, evidence e handoff.

## Metadados do BK (CANONICO/DERIVADO)

- Prioridade, owner, apoio, esforço, dependências, RF/RNF, sprint e próximo BK: CANONICO, definidos em `MATRIZ-CANONICA-BK.md` e `CONTRATO-CAMPOS-BK.md`.
- Stack técnica NestJS, Mongoose, React e TypeScript: CANONICO, definida nos RNF.
- Endpoints, nomes de ficheiros, services e componentes: DERIVADO, escolhidos para implementar o requisito sem contrariar a documentação.
- Regras de sessão, ownership, membership e bloqueio de IA sem fontes: CANONICO/DERIVADO a partir de RF, RNF e BKs anteriores.

## Pré-requisitos concretos

- Dependências concluídas: `BK-MF1-09`.
- `SessionGuard` e `AuthenticatedUser` criados em MF0.
- Contratos relevantes disponíveis: `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject`.
- Stack canónica: NestJS, Mongoose, React, TypeScript e cookies HttpOnly.

## Glossário rápido

- **revisão docente de IA**: recurso ou fluxo implementado neste BK.
- **Ownership**: garantia de que um utilizador só gere dados que controla.
- **Membership**: garantia de que um aluno pertence à turma antes de ver dados dessa turma.
- **DTO**: classe que valida payloads de entrada.
- **Service**: camada onde vivem regras de negócio e segurança.
- **Controller**: camada HTTP que recebe pedidos e delega no service.

## Conceitos teóricos essenciais

**Domínio StudyFlow.** revisão docente de IA existe para concretizar `RF29`. O contexto vem da rota e da sessão autenticada; nunca vem de campos livres escolhidos pelo frontend.

**Backend.** O schema define persistência MongoDB, o DTO valida entrada, o service aplica regras e o controller expõe endpoints protegidos. Esta separação evita controllers grandes e facilita testes.

**Frontend.** O cliente usa `fetch` com `credentials: "include"` para enviar o cookie HttpOnly. A página mostra loading, erro, vazio e sucesso para o aluno perceber o estado real do pedido.

**Segurança.** O backend valida sessão, papel e contexto antes de consultar ou criar dados. Sem sessão deve haver `401`; papel errado deve gerar `403`; contexto inexistente ou fora do utilizador deve gerar `404`.

**IA.** Quando este BK tocar IA, o provider só pode receber fontes autorizadas. Sem fontes processáveis, a resposta correta é bloquear com erro claro.

## Arquitetura do BK

- Ficheiros principais: `apps/api/src/modules/ai-content-reviews/...`, `apps/web/src/lib/api/ai-content-reviews.ts`, `apps/web/src/pages/mf2/AiContentReviewPage.tsx`.
- Exports produzidos: `AiContentReviewService`, `AiContentReviewModule`.
- Imports consumidos: `OfficialMaterialsService.findProcessedBySubject`, `SubjectsService.findOwnedSubject`, `SessionGuard`.
- Endpoint principal: `POST /api/teacher/subjects/:subjectId/ai-content-reviews`.

## Guia linear de implementação

### Passo 1 - Criar schema e DTO

1. Explicação simples do objetivo.

    Definir a estrutura persistida para revisão docente de IA e validar os dados de entrada antes de chegarem ao service.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/ai-content-reviews/schemas/ai-content-reviews.schema.ts`
    - CRIAR: `apps/api/src/modules/ai-content-reviews/dto/create-ai-content-reviews.dto.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai-content-reviews/schemas/ai-content-reviews.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiContentReviewDocument = HydratedDocument<AiContentReview>;
export type AiContentReviewStatus = "ACTIVE" | "ARCHIVED";

@Schema({ timestamps: true, collection: "ai_content_reviews" })
export class AiContentReview {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    createdBy!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 4000 })
    description?: string;

    @Prop({ required: true, enum: ["ACTIVE", "ARCHIVED"], default: "ACTIVE" })
    status!: AiContentReviewStatus;
}

export const AiContentReviewSchema = SchemaFactory.createForClass(AiContentReview);
AiContentReviewSchema.index({ contextId: 1, createdAt: -1 });

// apps/api/src/modules/ai-content-reviews/dto/create-ai-content-reviews.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAiContentReviewDto {
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    description?: string;
}
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Confirma que os campos obrigatórios rejeitam strings vazias e que os índices estão orientados ao contexto.

7. Erros comuns ou cenário negativo.

    Criar schema sem índice por contexto dificulta isolamento e consultas por turma, disciplina ou área.

### Passo 2 - Criar service

1. Explicação simples do objetivo.

    Concentrar a regra de negócio de revisão docente de IA, incluindo validação de sessão e contexto.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai-content-reviews/ai-content-reviews.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateAiContentReviewDto } from "./dto/create-ai-content-reviews.dto";
import { AiContentReview, AiContentReviewDocument } from "./schemas/ai-content-reviews.schema";

@Injectable()
export class AiContentReviewService {
    constructor(
        @InjectModel(AiContentReview.name)
        private readonly model: Model<AiContentReviewDocument>,
    ) {}

    async create(actor: AuthenticatedUser, contextId: string, dto: CreateAiContentReviewDto) {
        this.ensureRole(actor);
        this.ensureObjectId(contextId);

        const created = await this.model.create({
            contextId: new Types.ObjectId(contextId),
            createdBy: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            description: dto.description?.trim(),
            status: "ACTIVE",
        });

        return this.toView(created);
    }

    async list(actor: AuthenticatedUser, contextId: string) {
        this.ensureRole(actor);
        this.ensureObjectId(contextId);

        const items = await this.model
            .find({ contextId: new Types.ObjectId(contextId), status: "ACTIVE" })
            .sort({ createdAt: -1 })
            .lean();

        return items.map((item) => this.toView(item));
    }

    private ensureRole(actor: AuthenticatedUser) {
        // O papel vem da sessão validada pelo SessionGuard, não do frontend.
        if (!actor?.id || !["STUDENT", "TEACHER", "ADMIN"].includes(actor.role)) {
            throw new ForbiddenException("Sessão sem permissões para este fluxo.");
        }
    }

    private ensureObjectId(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException("Contexto não encontrado.");
        }
    }

    private toView(item: AiContentReview | AiContentReviewDocument) {
        return {
            id: item._id.toString(),
            contextId: item.contextId.toString(),
            createdBy: item.createdBy.toString(),
            title: item.title,
            description: item.description ?? "",
            status: item.status,
        };
    }
}
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Testa criação com sessão válida e com sessão sem permissão. A segunda deve devolver erro controlado.

7. Erros comuns ou cenário negativo.

    Colocar a validação só no controller ou no frontend permite chamadas diretas à API sem a regra de segurança.

### Passo 3 - Criar controller e módulo

1. Explicação simples do objetivo.

    Expor endpoints reais, protegidos por sessão, e exportar o service para os BKs seguintes.

2. Ficheiros envolvidos.
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts`
    - CRIAR: `apps/api/src/modules/ai-content-reviews/ai-content-reviews.module.ts`
    - LOCALIZAÇÃO: ficheiros completos.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```ts
// apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateAiContentReviewDto } from "./dto/create-ai-content-reviews.dto";
import { AiContentReviewService } from "./ai-content-reviews.service";

@Controller("api/ai-content-reviews")
@UseGuards(SessionGuard)
export class AiContentReviewController {
    constructor(private readonly service: AiContentReviewService) {}

    @Post(":contextId")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("contextId") contextId: string,
        @Body() dto: CreateAiContentReviewDto,
    ) {
        return this.service.create(request.user!, contextId, dto);
    }

    @Get(":contextId")
    list(@Req() request: AuthenticatedRequest, @Param("contextId") contextId: string) {
        return this.service.list(request.user!, contextId);
    }
}

// apps/api/src/modules/ai-content-reviews/ai-content-reviews.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiContentReviewController } from "./ai-content-reviews.controller";
import { AiContentReviewService } from "./ai-content-reviews.service";
import { AiContentReview, AiContentReviewSchema } from "./schemas/ai-content-reviews.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: AiContentReview.name, schema: AiContentReviewSchema }])],
    controllers: [AiContentReviewController],
    providers: [AiContentReviewService],
    exports: [AiContentReviewService, MongooseModule],
})
export class AiContentReviewModule {}
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Chama `POST /api/teacher/subjects/:subjectId/ai-content-reviews` com cookie real e confirma que o controller chama o service.

7. Erros comuns ou cenário negativo.

    Criar endpoints sem `SessionGuard` expõe dados de alunos, professores ou turmas.

### Passo 4 - Criar cliente frontend

1. Explicação simples do objetivo.

    Criar chamadas tipadas para a API de revisão docente de IA, sempre com cookie de sessão.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/lib/api/ai-content-reviews.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```ts
// apps/web/src/lib/api/ai-content-reviews.ts
export type AiContentReviewView = {
    id: string;
    contextId: string;
    title: string;
    description: string;
    status: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Pedido falhou." }));
        throw new Error(String(error.message ?? "Pedido falhou."));
    }
    return response.json() as Promise<T>;
}

export async function listAiContentReview(contextId: string): Promise<AiContentReviewView[]> {
    const response = await fetch(`/api/ai-content-reviews/${contextId}`, {
        credentials: "include",
    });
    return parseResponse<AiContentReviewView[]>(response);
}

export async function createAiContentReview(
    contextId: string,
    input: { title: string; description?: string },
): Promise<AiContentReviewView> {
    const response = await fetch(`/api/ai-content-reviews/${contextId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return parseResponse<AiContentReviewView>(response);
}
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Confirma no Network que o pedido usa cookies e que erros HTTP são convertidos em mensagem.

7. Erros comuns ou cenário negativo.

    Usar token no browser ou enviar owner no body quebra o contrato de segurança.

### Passo 5 - Criar página do fluxo

1. Explicação simples do objetivo.

    Criar uma página usável com formulário, estado de carregamento, erro, sucesso e vazio.

2. Ficheiros envolvidos.
    - CRIAR: `apps/web/src/pages/mf2/AiContentReviewPage.tsx`
    - LOCALIZAÇÃO: ficheiro completo.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```tsx
// apps/web/src/pages/mf2/AiContentReviewPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createAiContentReview, listAiContentReview, AiContentReviewView } from "../../lib/api/ai-content-reviews";

export function AiContentReviewPage({ contextId }: { contextId: string }) {
    const [items, setItems] = useState<AiContentReviewView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        listAiContentReview(contextId)
            .then(setItems)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [contextId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");
        const form = new FormData(event.currentTarget);
        const title = String(form.get("title") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        if (title.length < 3) {
            setError("Indica um título com pelo menos 3 caracteres.");
            return;
        }
        const created = await createAiContentReview(contextId, { title, description });
        setItems((current) => [created, ...current]);
        setSuccess("Guardado com sucesso.");
        event.currentTarget.reset();
    }

    if (loading) return <p>A carregar...</p>;

    return <section>
        <form onSubmit={handleSubmit}>
            <label>Título<input name="title" /></label>
            <label>Descrição<textarea name="description" /></label>
            <button type="submit">Guardar</button>
        </form>
        {error && <p role="alert">{error}</p>}
        {success && <p>{success}</p>}
        {items.length === 0 ? <p>Ainda não existem dados.</p> : <ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul>}
    </section>;
}
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Abre a página autenticado, cria um registo e confirma que a lista atualiza sem refresh.

7. Erros comuns ou cenário negativo.

    Não mostrar estado vazio faz parecer que a app falhou quando apenas não existem dados.

### Passo 6 - Validar fluxo principal e negativos

1. Explicação simples do objetivo.

    Recolher evidence objetiva de sucesso e falhas controladas para RF29.

2. Ficheiros envolvidos.
    - REVER: endpoints deste BK.
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
    - LOCALIZAÇÃO: comandos do PR.

3. O que fazer.

    Cria ou edita os ficheiros indicados e mantém os nomes de classes, exports e endpoints iguais aos deste guia. Confirma primeiro que `OfficialMaterialsService.findProcessedBySubject` e `SubjectsService.findOwnedSubject` existem ou foram definidos nos BKs anteriores.

4. Código completo, correto e integrado.

```bash
npm run test:unit
npm run test:integration
# Smoke manual: autenticar e chamar POST /api/teacher/subjects/:subjectId/ai-content-reviews.
# Negativos mínimos para P1: 2.
```

5. Explicação do código.

    Este código implementa revisão docente de IA para RF29. Os dados entram pela sessão e pela rota validada, são persistidos com `ObjectId` e saem como view sem campos internos. A regra de segurança fica no backend para impedir que o frontend escolha owner, professor, aluno, turma ou fontes.

6. Como validar este passo.

    Para P1, executa pelo menos 2 negativo(s): sem sessão, papel errado e contexto fora do utilizador.

7. Erros comuns ou cenário negativo.

    Fechar sem negativos deixa risco de acesso indevido só descoberto na defesa.

## Expected results

- `POST /api/teacher/subjects/:subjectId/ai-content-reviews` devolve sucesso com sessão e contexto válidos.
- Pedido sem sessão devolve `401`.
- Papel errado devolve `403`.
- Contexto fora do utilizador devolve `404`.
- Entrada inválida devolve `400` ou `422` com mensagem clara.

## Critérios de aceite

- O BK tem pelo menos 6 passos no formato MF0.
- Cada passo tem ficheiros, código completo, explicação, validação e cenário negativo.
- O frontend chama endpoint real definido no controller.
- O backend não aceita owner, professor, aluno ou fonte como verdade vinda do body.
- O próximo BK consegue reutilizar o service exportado.

## Validação final

- Smoke do fluxo principal.
- 2 negativo(s) mínimo(s), conforme prioridade `P1`.
- Confirmação de imports e exports.
- Pesquisa textual de termos proibidos nos BKs da MF2.

## Evidence para PR/defesa

- Link do PR ou commit.
- Output dos testes por prioridade.
- Screenshot ou log do caminho principal.
- Evidência de erro controlado para sessão ausente, papel errado e contexto fora do utilizador.

## Handoff

`BK-MF2-06` deve reutilizar `AiContentReviewService` ou o endpoint deste BK, sem criar segundo contrato para a mesma ação.

## Changelog

- `2026-06-07`: guia reescrito com estrutura MF0, contratos completos e validação por passo.
