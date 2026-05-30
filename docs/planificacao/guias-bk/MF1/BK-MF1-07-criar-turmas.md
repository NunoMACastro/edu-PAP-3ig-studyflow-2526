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

## O que vamos fazer neste BK
Este BK implementa `RF19`: Criar turmas. O objetivo é guiar a implementação completa deste requisito, desde o contrato de dados até ao endpoint protegido e à chamada no frontend.

No final, deves conseguir responder a quatro perguntas sem consultar outro ficheiro: que dados são guardados, quem pode executar a ação, que validações acontecem no backend e que resultado a aplicação mostra ao utilizador.

## Porque é que isto é importante
A `MF1` introduz colaboração, turmas, disciplinas e IA contextual. Isso significa que a aplicação deixa de trabalhar apenas com dados privados de um aluno e passa a cruzar dados de alunos, professores, salas e turmas.

Por isso, a prioridade deste BK é dupla: implementar a funcionalidade pedida e manter fronteiras de segurança claras. Em cada endpoint, a identidade confiável vem da sessão autenticada e nunca de campos enviados livremente pelo frontend.

## O que entra (scope)
- Criar turmas oficiais associadas ao professor autenticado.
- Listar apenas as turmas do professor autenticado.
- Guardar código, ano letivo e lista inicial de alunos.
- Preparar base para disciplinas, materiais oficiais e publicações.

## O que não entra (scope-out)
- Inscrição automática de alunos.
- Importação por CSV.
- Horários, avaliações ou sumários.

## Como saber que isto ficou bem
- Professor cria turma e recebe `201 Created`.
- Aluno recebe `403 Forbidden`.
- Código duplicado no mesmo professor recebe `409 Conflict`.
- Listagem não mostra turmas de outro professor.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-07` (CANONICO)
- Requisito: `RF19` (CANONICO)
- Ator principal: professor autenticado (DERIVADO a partir do requisito)
- Endpoint principal: `POST /api/teacher/classes` (DERIVADO a partir da implementação)
- Persistência principal: `school_classes` (DERIVADO a partir do modelo)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF0-02` para sessão segura.
- `BK-MF0-03` para perfil e papel do utilizador.

## Glossário rápido
- `Ownership`: regra que garante que cada utilizador só acede ao seu próprio contexto.
- `DTO`: classe que valida a entrada HTTP antes da regra de negócio.
- `Service`: camada onde ficam validações de papel, permissões, ownership e persistência.
- `Controller`: camada HTTP; recebe sessão, body e parâmetros, mas não decide regras de negócio.
- `IDOR`: falha de segurança em que alguém acede a dados de outro utilizador mudando um ID no pedido.

## Conceitos teóricos essenciais
- Uma turma é um contexto oficial controlado por um professor.
- O `teacherId` deve vir da sessão, nunca do body.
- O código da turma é legível para humanos; o `_id` continua a ser o identificador técnico.

## Arquitetura final deste BK
A implementação assume a stack definida para o StudyFlow: NestJS no backend, MongoDB/Mongoose para persistência, React/TypeScript no frontend e autenticação por sessão com cookie HttpOnly.

### Ficheiros a criar ou editar
```text
apps/api/src/modules/classes/schemas/school-class.schema.ts
apps/api/src/modules/classes/dto/create-class.dto.ts
apps/api/src/modules/classes/services/classes.service.ts
apps/api/src/modules/classes/controllers/classes.controller.ts
apps/api/src/modules/classes/classes.module.ts
apps/web/src/lib/teacherClassesApi.ts
apps/web/src/pages/teacher/TeacherClassesPage.tsx
```

### Sequência do fluxo
1. Professor preenche nome, código e ano letivo.
2. Frontend envia pedido autenticado.
3. Controller valida sessão e DTO.
4. Service confirma papel `TEACHER` e código único por professor.
5. Turma é criada com `teacherId` da sessão.

### Erros que este BK deve evitar
- Aceitar `teacherId` no body.
- Permitir códigos duplicados no mesmo contexto.
- Criar turma sem professor dono.

## Guia linear de implementação

### Passo 1 - Confirmar contrato e dependências
Antes de escrever código, confirma o header deste BK e relê o requisito funcional. Se encontrares divergência entre documentos, regista-a no relatório de auditoria em vez de alterar silenciosamente `bk_id`, `rf_rnf`, `owner`, prioridade ou sprint.

Validação deste passo:
- O requisito no header continua alinhado com `docs/RF.md`.
- As dependências diretas estão concluídas ou explicitamente assumidas como pré-requisito.
- O endpoint escolhido não quebra a organização por ator: `/api/student/...` para aluno e `/api/teacher/...` para professor.

Erro comum: começar por criar a página React e só depois descobrir que o backend não sabe quem tem permissão. Neste tipo de funcionalidade, a regra de autorização vem primeiro.

### Passo 2 - Criar modelo e DTO
O modelo define a forma do dado persistido. O DTO define o que o cliente pode enviar. Campos como `userId`, `teacherId`, `ownerId`, `studentId` ou `authorId` não aparecem no DTO quando podem ser obtidos pela sessão.

```ts
// apps/api/src/modules/classes/schemas/school-class.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchoolClassDocument = HydratedDocument<SchoolClass>;

@Schema({ timestamps: true, collection: 'school_classes' })
export class SchoolClass {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  teacherId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true, uppercase: true, maxlength: 20 })
  code!: string;

  @Prop({ trim: true, maxlength: 40, default: '2025/2026' })
  schoolYear!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  studentIds!: Types.ObjectId[];
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
SchoolClassSchema.index({ teacherId: 1, code: 1 }, { unique: true });

// apps/api/src/modules/classes/dto/create-class.dto.ts
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9-]{4,20}$/)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  schoolYear?: string;
}
```

Explicação do código:
- O schema inclui índices para as queries usadas pelo service.
- O DTO limita tamanho, formato e valores permitidos.
- A identidade do ator fica fora do body para evitar mass assignment.
- O nome dos ficheiros indica claramente o contexto funcional do BK.

Validação deste passo:
- Payload incompleto devolve `400 Bad Request`.
- IDs inválidos devolvem `400 Bad Request` antes de executar a regra de negócio.
- Campos extra não devem ser usados para determinar ownership.

### Passo 3 - Criar service completo
O service abaixo é a peça central do BK. Ele contém as validações de papel, ownership, contexto, estados inválidos e normalização dos dados guardados.

```ts
// apps/api/src/modules/classes/services/classes.service.ts
import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CreateClassDto } from '../dto/create-class.dto';
import { SchoolClass, SchoolClassDocument } from '../schemas/school-class.schema';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(SchoolClass.name)
    private readonly classModel: Model<SchoolClassDocument>,
  ) {}

  async create(actor: AuthenticatedUser, dto: CreateClassDto) {
    this.assertTeacher(actor);

    const teacherId = new Types.ObjectId(actor.id);
    const code = dto.code.trim().toUpperCase();
    const exists = await this.classModel.exists({ teacherId, code });

    if (exists) {
      throw new ConflictException('Já existe uma turma com esse código.');
    }

    const created = await this.classModel.create({
      teacherId,
      name: dto.name.trim(),
      code,
      schoolYear: dto.schoolYear?.trim() || '2025/2026',
      studentIds: [],
    });

    return this.toView(created);
  }

  async listMine(actor: AuthenticatedUser) {
    this.assertTeacher(actor);

    const classes = await this.classModel
      .find({ teacherId: new Types.ObjectId(actor.id) })
      .sort({ createdAt: -1 })
      .lean();

    return classes.map((schoolClass) => this.toView(schoolClass));
  }

  private assertTeacher(actor: AuthenticatedUser) {
    if (actor.role !== 'TEACHER') {
      throw new ForbiddenException('Apenas professores podem gerir turmas.');
    }
  }

  private toView(schoolClass: SchoolClassDocument | SchoolClass & { _id: Types.ObjectId }) {
    return {
      id: schoolClass._id.toString(),
      name: schoolClass.name,
      code: schoolClass.code,
      schoolYear: schoolClass.schoolYear,
      studentCount: schoolClass.studentIds.length,
    };
  }
}
```

Explicação do código:
- A primeira decisão é sempre validar o papel do ator.
- As queries sensíveis incluem o contexto autorizado, não apenas `_id`.
- As exceções têm mensagens controladas e não revelam detalhes internos.
- A resposta final é uma view simples, adequada ao frontend.

Validação deste passo:
- Ator sem permissão recebe `403 Forbidden`.
- Recurso fora do contexto do ator recebe `404 Not Found` ou `403 Forbidden`, conforme a regra do BK.
- Caminho principal devolve a view esperada.

### Passo 4 - Criar controller e módulo
O controller protege a rota com sessão, recebe parâmetros e body, e delega a regra de negócio no service. O módulo regista todos os schemas necessários para o service funcionar.

```ts
// apps/api/src/modules/classes/controllers/classes.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CreateClassDto } from '../dto/create-class.dto';
import { ClassesService } from '../services/classes.service';

@UseGuards(SessionGuard)
@Controller('api/teacher/classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Req() request: Request, @Body() dto: CreateClassDto) {
    return this.classesService.create(request.user, dto);
  }

  @Get()
  listMine(@Req() request: Request) {
    return this.classesService.listMine(request.user);
  }
}

// apps/api/src/modules/classes/classes.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesController } from './controllers/classes.controller';
import { SchoolClass, SchoolClassSchema } from './schemas/school-class.schema';
import { ClassesService } from './services/classes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: SchoolClass.name, schema: SchoolClassSchema }])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
```

Explicação do código:
- `SessionGuard` impede chamadas anónimas.
- `request.user` é a fonte confiável de identidade.
- `@Param` identifica o contexto técnico, mas o service confirma se esse contexto pertence ao ator.
- O módulo torna explícitas as dependências de persistência usadas neste BK.

Validação deste passo:
- Pedido sem sessão devolve `401 Unauthorized`.
- Pedido autenticado chama o método certo do service.
- O controller não contém regras de ownership duplicadas.

### Passo 5 - Criar cliente frontend
O frontend chama o endpoint com `credentials: 'include'` para enviar o cookie HttpOnly. A UI deve mostrar loading, erro e sucesso, mas a segurança principal continua sempre no backend.

```tsx
// apps/web/src/lib/teacherClassesApi.ts
export type CreateClassPayload = {
  name: string;
  code: string;
  schoolYear?: string;
};

export type SchoolClassView = {
  id: string;
  name: string;
  code: string;
  schoolYear: string;
  studentCount: number;
};

export async function createSchoolClass(payload: CreateClassPayload): Promise<SchoolClassView> {
  const response = await fetch('/api/teacher/classes', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Não foi possível criar a turma.');
  }

  return response.json() as Promise<SchoolClassView>;
}

// apps/web/src/pages/teacher/TeacherClassesPage.tsx
import { FormEvent, useState } from 'react';
import { createSchoolClass, SchoolClassView } from '../../lib/teacherClassesApi';

export function TeacherClassesPage() {
  const [classes, setClasses] = useState<SchoolClassView[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const created = await createSchoolClass({ name, code: code.toUpperCase() });
      setClasses((current) => [created, ...current]);
      setName('');
      setCode('');
    } catch {
      setError('Confirma os dados da turma e tenta novamente.');
    }
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-4 p-6">
      <h1 className="text-2xl font-semibold">Turmas</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome da turma" />
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código" />
        <button disabled={name.trim().length < 2 || code.trim().length < 4} type="submit">Criar turma</button>
      </form>
      {error && <p>{error}</p>}
      <ul>{classes.map((schoolClass) => <li key={schoolClass.id}>{schoolClass.name}</li>)}</ul>
    </main>
  );
}
```

Explicação do código:
- O payload tem tipo próprio; não há chamadas com `unknown`.
- O cookie de sessão é enviado sem expor tokens ao JavaScript.
- O formulário impede submissões óbvias incompletas, mas o backend continua a validar tudo.
- A mensagem de erro é curta e segura para o utilizador final.

Validação deste passo:
- O botão fica bloqueado quando faltam dados mínimos.
- Uma resposta de sucesso atualiza a página sem refresh manual.
- Uma resposta de erro mostra feedback sem expor stack trace.

### Passo 6 - Validar caminho principal e negativos
Caminho principal esperado:
- Criar turma com professor autenticado devolve `201 Created`.
- `GET /api/teacher/classes` devolve apenas turmas desse professor.

Cenários negativos obrigatórios:
- Aluno tenta criar turma e recebe `403 Forbidden`.
- Código duplicado recebe `409 Conflict`.
- Pedido sem sessão recebe `401 Unauthorized`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

Se algum comando falhar por infraestrutura, regista o erro exato. Não escrevas que está validado se o comando não correu.

### Passo 7 - Revisão de segurança e privacidade
Antes de fechar, confirma:
- O backend ignora IDs de utilizador recebidos no body.
- Todas as queries com dados de utilizador filtram pelo contexto autorizado.
- Dados de aluno, professor, turma, disciplina ou sala não aparecem fora do contexto correto.
- Quando existe IA, a resposta fica limitada às fontes permitidas.
- Erros são claros para o utilizador, mas não revelam detalhes internos.

## Evidência de conclusão
- Output do pedido `POST` com turma criada.
- Output de listagem sem turmas de outro professor.
- Registo dos três negativos obrigatórios.

## Handoff para o próximo BK
- `BK-MF1-08` usa `SchoolClass.teacherId` para autorizar disciplinas.
- `BK-MF1-12` usa `SchoolClass.studentIds` para publicações visíveis aos alunos.

## Checklist final
- [ ] Header preservado sem alterações a campos canónicos.
- [ ] Modelo, DTO, service, controller/módulo e frontend descritos com código completo para este BK.
- [ ] Código sem helpers por implementar, `any` desnecessário ou payloads sem tipo.
- [ ] Caminho principal e cenários negativos têm expected results concretos.
- [ ] Validação documental executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com implementação fechada por BK, explicação didática e validação objetiva.
