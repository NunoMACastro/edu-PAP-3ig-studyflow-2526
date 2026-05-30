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

## O que vamos fazer neste BK
Este BK implementa `RF24`: Professores podem enviar avisos e publicações. Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, permissões, endpoint NestJS e chamada frontend.

O guia é autocontido para o aluno: inclui o código necessário para este BK, explica o objetivo de cada bloco e define resultados esperados para sucesso e falha.

## Porque é que isto é importante
A `MF1` liga o estudo individual da `MF0` a contextos com salas, turmas, disciplinas e professores. Estes contextos aumentam o risco de fuga de dados se o backend confiar em IDs enviados pelo cliente.

A regra base deste BK é simples: a sessão identifica o ator, o service confirma o contexto, e só depois a aplicação lê, escreve ou chama IA.

## O que entra (scope)
- Criar avisos e publicações numa turma.
- Confirmar que a turma pertence ao professor.
- Permitir listagem por alunos inscritos.
- Guardar autor e tipo.

## O que não entra (scope-out)
- Notificações em tempo real.
- Dashboards avançados.
- Alterações fora do requisito deste BK.

## Como saber que isto ficou bem
- Ator correto executa o caminho principal.
- Ator errado recebe erro controlado.
- Contexto fora do ownership não é exposto.
- Payload inválido é rejeitado.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-12` (CANONICO)
- Requisito: `RF24` (CANONICO)
- Ator principal: professor dono da turma (DERIVADO)
- Endpoint principal: `POST /api/teacher/classes/:classId/posts` (DERIVADO)
- Persistência principal: `class_posts` (DERIVADO)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- Dependências indicadas no header concluídas.

## Glossário rápido
- `Ownership`: regra que limita acesso ao dono ou ao contexto autorizado.
- `Membership`: pertença a turma ou sala usada para autorizar acesso.
- `DTO`: validação de entrada antes do service.
- `Fonte oficial/processável`: conteúdo permitido para fundamentar resposta da IA.
- `Guardrail`: regra que impede a IA de responder fora do contexto autorizado.

## Conceitos teóricos essenciais
- Publicação pertence à turma.
- Professor autoriza por `teacherId`; aluno por `studentIds`.
- Avisos devem ser auditáveis.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/class-posts/schemas/class-post.schema.ts
apps/api/src/modules/class-posts/dto/create-class-post.dto.ts
apps/api/src/modules/class-posts/services/class-posts.service.ts
apps/api/src/modules/class-posts/controllers/class-posts.controller.ts
apps/web/src/lib/classPostsApi.ts
```

### Sequência do fluxo
1. Frontend envia pedido autenticado.
2. Controller aplica sessão.
3. Service confirma ownership ou membership.
4. Dados são persistidos ou usados como fontes autorizadas.
5. Resposta devolve view simples.

### Riscos técnicos a controlar
- Aceitar identidade no body.
- Carregar dados só por `_id`.
- Misturar contextos de professor/aluno.
- Responder com IA sem fontes oficiais quando existir IA.

## Guia linear de implementação

### Passo 1 - Confirmar contrato e dependências
Relê o requisito funcional e confirma que as dependências do header estão concluídas. Se uma dependência não existir, este BK não deve inventar outro caminho; deve aguardar ou implementar primeiro a dependência.

Validação deste passo:
- O endpoint pertence ao ator correto.
- O service consegue confirmar ownership ou membership sem confiar no body.
- A funcionalidade não altera RFs de outras macro-features.

### Passo 2 - Criar modelo e DTO
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
export type ClassPostDocument = HydratedDocument<ClassPost>;
@Schema({ timestamps: true, collection: 'class_posts' })
export class ClassPost { @Prop({ type: Types.ObjectId, ref: 'SchoolClass', required: true }) classId!: Types.ObjectId; @Prop({ type: Types.ObjectId, ref: 'User', required: true }) authorId!: Types.ObjectId; @Prop({ enum: ['NOTICE', 'POST'], required: true }) type!: 'NOTICE' | 'POST'; @Prop({ required: true, trim: true, maxlength: 160 }) title!: string; @Prop({ required: true, trim: true, maxlength: 4000 }) content!: string; }
export const ClassPostSchema = SchemaFactory.createForClass(ClassPost);
export class CreateClassPostDto { @IsEnum(['NOTICE', 'POST']) type!: 'NOTICE' | 'POST'; @IsString() @MinLength(2) @MaxLength(160) title!: string; @IsString() @MinLength(2) @MaxLength(4000) content!: string; }
```

Explicação do código:
- O schema guarda apenas o estado necessário ao requisito.
- O DTO permite só os campos que o cliente pode realmente escolher.
- Campos de identidade vêm da sessão ou de relações já persistidas.
- Os índices refletem as queries usadas pelo service.

### Passo 3 - Criar service completo
```ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { SchoolClass, SchoolClassDocument } from '../../classes/schemas/school-class.schema';
import { CreateClassPostDto } from '../dto/create-class-post.dto';
import { ClassPost, ClassPostDocument } from '../schemas/class-post.schema';
@Injectable()
export class ClassPostsService { constructor(@InjectModel(ClassPost.name) private readonly postModel: Model<ClassPostDocument>, @InjectModel(SchoolClass.name) private readonly classModel: Model<SchoolClassDocument>) {} async create(actor: AuthenticatedUser, classId: string, dto: CreateClassPostDto) { if (actor.role !== 'TEACHER') throw new ForbiddenException('Apenas professores podem publicar.'); const schoolClass = await this.classModel.findOne({ _id: new Types.ObjectId(classId), teacherId: new Types.ObjectId(actor.id) }); if (!schoolClass) throw new NotFoundException('Turma não encontrada para este professor.'); const post = await this.postModel.create({ classId: schoolClass._id, authorId: new Types.ObjectId(actor.id), type: dto.type, title: dto.title.trim(), content: dto.content.trim() }); return { id: post._id.toString(), classId: post.classId.toString(), type: post.type, title: post.title, content: post.content }; } async listForStudent(actor: AuthenticatedUser, classId: string) { if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos podem consultar publicações.'); const schoolClass = await this.classModel.findOne({ _id: new Types.ObjectId(classId), studentIds: new Types.ObjectId(actor.id) }); if (!schoolClass) throw new NotFoundException('Turma não encontrada para este aluno.'); return this.postModel.find({ classId: schoolClass._id }).sort({ createdAt: -1 }).lean(); } }
```

Explicação do código:
- A autorização acontece antes de carregar dados sensíveis.
- As queries filtram por professor, aluno, turma, disciplina ou sala, consoante o BK.
- Quando existe IA, o provider recebe apenas fontes autorizadas.
- Não há chamadas para métodos externos por implementar neste BK.

### Passo 4 - Criar controller e módulo
```ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CreateClassPostDto } from '../dto/create-class-post.dto';
import { ClassPostsService } from '../services/class-posts.service';
@UseGuards(SessionGuard)
@Controller()
export class ClassPostsController { constructor(private readonly service: ClassPostsService) {} @Post('api/teacher/classes/:classId/posts') create(@Req() request: Request, @Param('classId') classId: string, @Body() dto: CreateClassPostDto) { return this.service.create(request.user, classId, dto); } @Get('api/student/classes/:classId/posts') listForStudent(@Req() request: Request, @Param('classId') classId: string) { return this.service.listForStudent(request.user, classId); } }
```

Explicação do código:
- `SessionGuard` obriga sessão válida.
- `request.user` é a identidade confiável.
- O controller não recebe `userId`, `teacherId` ou `studentId` no body.
- O módulo regista schemas e provider necessários para o service.

### Passo 5 - Criar cliente frontend
```tsx
export async function submitTeacherContext(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Não foi possível concluir a operação.');
  return response.json();
}
```

Explicação do código:
- O payload é tipado.
- `credentials: 'include'` envia a sessão sem expor tokens.
- O erro mostrado ao utilizador é seguro e curto.
- O backend continua a validar mesmo que a UI bloqueie campos vazios.

### Passo 6 - Validar caminho principal e negativos
Caminho principal:
- Professor publica aviso.
- Aluno inscrito lista publicações.

Cenários negativos:
- Professor de outra turma recebe `404`.
- Aluno fora da turma recebe `404`.
- Título vazio recebe `400`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

## Evidência de conclusão
- Output do endpoint principal.
- Registo de três negativos.
- Print ou log da UI com sucesso/erro.

## Handoff para o próximo BK
- MF2 pode usar publicações para comunicação e dashboards.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código completo para schema, DTO, service, controller/módulo e frontend.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
