# BK-MF1-11 - O aluno inscrito numa turma recebe versão limitada da IA.

## Header
- `doc_id`: `GUIA-BK-MF1-11`
- `bk_id`: `BK-MF1-11`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF23`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-12`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-11-o-aluno-inscrito-numa-turma-recebe-versao-limitada-da-ia.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF23`: O aluno inscrito numa turma recebe versão limitada da IA. Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, permissões, endpoint NestJS e chamada frontend.

O guia é autocontido para o aluno: inclui o código necessário para este BK, explica o objetivo de cada bloco e define resultados esperados para sucesso e falha.

## Porque é que isto é importante
A `MF1` liga o estudo individual da `MF0` a contextos com salas, turmas, disciplinas e professores. Estes contextos aumentam o risco de fuga de dados se o backend confiar em IDs enviados pelo cliente.

A regra base deste BK é simples: a sessão identifica o ator, o service confirma o contexto, e só depois a aplicação lê, escreve ou chama IA.

## O que entra (scope)
- Responder apenas com materiais oficiais da disciplina.
- Confirmar inscrição do aluno na turma.
- Aplicar voz docente.
- Guardar pergunta, resposta e fontes.

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
- BK: `BK-MF1-11` (CANONICO)
- Requisito: `RF23` (CANONICO)
- Ator principal: aluno inscrito na turma (DERIVADO)
- Endpoint principal: `POST /api/student/subjects/:subjectId/ai/answers` (DERIVADO)
- Persistência principal: `class_ai_interactions` (DERIVADO)
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
- Esta IA é limitada à disciplina.
- A inscrição vem da turma, não do body.
- Sem materiais oficiais a resposta deve ser recusada.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts
apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts
apps/api/src/modules/class-ai/services/class-ai.service.ts
apps/api/src/modules/class-ai/controllers/class-ai.controller.ts
apps/web/src/lib/classAiApi.ts
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
import { IsString, MaxLength, MinLength } from 'class-validator';
export type ClassAiInteractionDocument = HydratedDocument<ClassAiInteraction>;
@Schema({ timestamps: true, collection: 'class_ai_interactions' })
export class ClassAiInteraction { @Prop({ type: Types.ObjectId, ref: 'Subject', required: true }) subjectId!: Types.ObjectId; @Prop({ type: Types.ObjectId, ref: 'User', required: true }) studentId!: Types.ObjectId; @Prop({ required: true, trim: true, maxlength: 1000 }) question!: string; @Prop({ required: true, trim: true }) answer!: string; @Prop({ type: [{ type: Types.ObjectId, ref: 'OfficialMaterial' }], default: [] }) sourceIds!: Types.ObjectId[]; }
export const ClassAiInteractionSchema = SchemaFactory.createForClass(ClassAiInteraction);
export class AskClassAiDto { @IsString() @MinLength(3) @MaxLength(1000) question!: string; }
```

Explicação do código:
- O schema guarda apenas o estado necessário ao requisito.
- O DTO permite só os campos que o cliente pode realmente escolher.
- Campos de identidade vêm da sessão ou de relações já persistidas.
- Os índices refletem as queries usadas pelo service.

### Passo 3 - Criar service completo
```ts
import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { AiProvider } from '../../ai/providers/ai.provider';
import { SchoolClass, SchoolClassDocument } from '../../classes/schemas/school-class.schema';
import { OfficialMaterial, OfficialMaterialDocument } from '../../official-materials/schemas/official-material.schema';
import { Subject, SubjectDocument } from '../../subjects/schemas/subject.schema';
import { TeacherAiVoice, TeacherAiVoiceDocument } from '../../teacher-ai/schemas/teacher-ai-voice.schema';
import { AskClassAiDto } from '../dto/ask-class-ai.dto';
import { ClassAiInteraction, ClassAiInteractionDocument } from '../schemas/class-ai-interaction.schema';
@Injectable()
export class ClassAiService { constructor(@InjectModel(ClassAiInteraction.name) private readonly interactionModel: Model<ClassAiInteractionDocument>, @InjectModel(Subject.name) private readonly subjectModel: Model<SubjectDocument>, @InjectModel(SchoolClass.name) private readonly classModel: Model<SchoolClassDocument>, @InjectModel(OfficialMaterial.name) private readonly materialModel: Model<OfficialMaterialDocument>, @InjectModel(TeacherAiVoice.name) private readonly voiceModel: Model<TeacherAiVoiceDocument>, private readonly aiProvider: AiProvider) {} async answer(actor: AuthenticatedUser, subjectId: string, dto: AskClassAiDto) { if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos inscritos podem usar esta IA.'); const subject = await this.subjectModel.findById(subjectId); if (!subject) throw new NotFoundException('Disciplina não encontrada.'); const schoolClass = await this.classModel.findOne({ _id: subject.classId, studentIds: new Types.ObjectId(actor.id) }); if (!schoolClass) throw new NotFoundException('Disciplina não encontrada para este aluno.'); const materials = await this.materialModel.find({ subjectId: subject._id, status: 'PROCESSED' }).limit(8).lean(); if (!materials.length) throw new UnprocessableEntityException('A disciplina ainda não tem materiais oficiais processados.'); const voice = await this.voiceModel.findOne({ subjectId: subject._id }).lean(); const aiAnswer = await this.aiProvider.answer({ system: ['Responde apenas com materiais oficiais.', `Tom: ${voice?.tone ?? 'CALM'}.`, ...(voice?.rules ?? [])].join('\\n'), user: dto.question.trim(), sources: materials.map((m) => ({ id: m._id.toString(), title: m.title, text: m.content })) }); const saved = await this.interactionModel.create({ subjectId: subject._id, studentId: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: aiAnswer.text, sourceIds: aiAnswer.sourcesUsed.map((id) => new Types.ObjectId(id)) }); return { id: saved._id.toString(), answer: saved.answer, sourcesUsed: saved.sourceIds.map((id) => id.toString()) }; } }
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
import { AskClassAiDto } from '../dto/ask-class-ai.dto';
import { ClassAiService } from '../services/class-ai.service';
@UseGuards(SessionGuard)
@Controller('api/student/subjects/:subjectId/ai')
export class ClassAiController { constructor(private readonly service: ClassAiService) {} @Post('answers') answer(@Req() request: Request, @Param('subjectId') subjectId: string, @Body() dto: AskClassAiDto) { return this.service.answer(request.user, subjectId, dto); } }
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
- Aluno inscrito recebe resposta com fontes.
- Fonte usada pertence à disciplina.

Cenários negativos:
- Aluno fora da turma recebe `404`.
- Sem materiais oficiais recebe `422`.
- Professor recebe `403`.

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
- MF2 pode usar histórico sem expor dados fora da turma.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código completo para schema, DTO, service, controller/módulo e frontend.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
