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

## O que vamos fazer neste BK
Este BK implementa `RF21`: Submeter materiais da disciplina (versão oficial). Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, permissões, endpoint NestJS e chamada frontend.

O guia é autocontido para o aluno: inclui o código necessário para este BK, explica o objetivo de cada bloco e define resultados esperados para sucesso e falha.

## Porque é que isto é importante
A `MF1` liga o estudo individual da `MF0` a contextos com salas, turmas, disciplinas e professores. Estes contextos aumentam o risco de fuga de dados se o backend confiar em IDs enviados pelo cliente.

A regra base deste BK é simples: a sessão identifica o ator, o service confirma o contexto, e só depois a aplicação lê, escreve ou chama IA.

## O que entra (scope)
- Criar materiais oficiais `TEXT` ou `URL`.
- Confirmar que a disciplina pertence ao professor.
- Guardar estado `PROCESSED` ou `REFERENCE_ONLY`.
- Preparar fontes para IA limitada.

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
- BK: `BK-MF1-09` (CANONICO)
- Requisito: `RF21` (CANONICO)
- Ator principal: professor dono da disciplina (DERIVADO)
- Endpoint principal: `POST /api/teacher/subjects/:subjectId/materials` (DERIVADO)
- Persistência principal: `official_materials` (DERIVADO)
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
- Material oficial tem autoridade pedagógica do professor.
- URL é referência; texto pode ser fonte processável imediata.
- A autorização passa pela disciplina, não pelo material isolado.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/official-materials/schemas/official-material.schema.ts
apps/api/src/modules/official-materials/dto/create-official-material.dto.ts
apps/api/src/modules/official-materials/services/official-materials.service.ts
apps/api/src/modules/official-materials/controllers/official-materials.controller.ts
apps/web/src/lib/officialMaterialsApi.ts
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
import { IsEnum, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from 'class-validator';
export type OfficialMaterialDocument = HydratedDocument<OfficialMaterial>;
@Schema({ timestamps: true, collection: 'official_materials' })
export class OfficialMaterial { @Prop({ type: Types.ObjectId, ref: 'Subject', required: true, index: true }) subjectId!: Types.ObjectId; @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) teacherId!: Types.ObjectId; @Prop({ required: true, trim: true, maxlength: 160 }) title!: string; @Prop({ enum: ['TEXT', 'URL'], required: true }) type!: 'TEXT' | 'URL'; @Prop({ required: true, trim: true, maxlength: 12000 }) content!: string; @Prop({ enum: ['PROCESSED', 'REFERENCE_ONLY'], default: 'PROCESSED' }) status!: 'PROCESSED' | 'REFERENCE_ONLY'; }
export const OfficialMaterialSchema = SchemaFactory.createForClass(OfficialMaterial);
export class CreateOfficialMaterialDto { @IsString() @MinLength(2) @MaxLength(160) title!: string; @IsEnum(['TEXT', 'URL']) type!: 'TEXT' | 'URL'; @ValidateIf((d: CreateOfficialMaterialDto) => d.type === 'URL') @IsUrl() content!: string; @ValidateIf((d: CreateOfficialMaterialDto) => d.type === 'TEXT') @IsString() @MinLength(20) @MaxLength(12000) content!: string; }
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
import { Subject, SubjectDocument } from '../../subjects/schemas/subject.schema';
import { CreateOfficialMaterialDto } from '../dto/create-official-material.dto';
import { OfficialMaterial, OfficialMaterialDocument } from '../schemas/official-material.schema';
@Injectable()
export class OfficialMaterialsService { constructor(@InjectModel(OfficialMaterial.name) private readonly materialModel: Model<OfficialMaterialDocument>, @InjectModel(Subject.name) private readonly subjectModel: Model<SubjectDocument>) {} async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialMaterialDto) { this.assertTeacher(actor); const subject = await this.findOwnedSubject(actor.id, subjectId); const material = await this.materialModel.create({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id), title: dto.title.trim(), type: dto.type, content: dto.content.trim(), status: dto.type === 'TEXT' ? 'PROCESSED' : 'REFERENCE_ONLY' }); return { id: material._id.toString(), subjectId: material.subjectId.toString(), title: material.title, type: material.type, status: material.status }; } private async findOwnedSubject(teacherId: string, subjectId: string) { const subject = await this.subjectModel.findOne({ _id: new Types.ObjectId(subjectId), teacherId: new Types.ObjectId(teacherId) }); if (!subject) throw new NotFoundException('Disciplina não encontrada para este professor.'); return subject; } private assertTeacher(actor: AuthenticatedUser) { if (actor.role !== 'TEACHER') throw new ForbiddenException('Apenas professores podem gerir materiais oficiais.'); } }
```

Explicação do código:
- A autorização acontece antes de carregar dados sensíveis.
- As queries filtram por professor, aluno, turma, disciplina ou sala, consoante o BK.
- Quando existe IA, o provider recebe apenas fontes autorizadas.
- Não há chamadas para métodos externos por implementar neste BK.

### Passo 4 - Criar controller e módulo
```ts
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CreateOfficialMaterialDto } from '../dto/create-official-material.dto';
import { OfficialMaterialsService } from '../services/official-materials.service';
@UseGuards(SessionGuard)
@Controller('api/teacher/subjects/:subjectId/materials')
export class OfficialMaterialsController { constructor(private readonly service: OfficialMaterialsService) {} @Post() create(@Req() request: Request, @Param('subjectId') subjectId: string, @Body() dto: CreateOfficialMaterialDto) { return this.service.create(request.user, subjectId, dto); } }
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
- Professor cria material oficial.
- Material `TEXT` fica `PROCESSED`.

Cenários negativos:
- Aluno recebe `403`.
- Professor de outra disciplina recebe `404`.
- Texto curto recebe `400`.

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
- `BK-MF1-11` usa estes materiais como fontes oficiais.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código completo para schema, DTO, service, controller/módulo e frontend.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
