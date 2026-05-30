# BK-MF1-01 - A IA deve adaptar explicações ao ritmo/dificuldades do aluno.

## Header
- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Natalia`
- `apoio`: `Guilherme`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-11`
- `rf_rnf`: `RF13`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-a-ia-deve-adaptar-explicacoes-ao-ritmo-dificuldades-do-aluno.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF13`: A IA deve adaptar explicações ao ritmo/dificuldades do aluno. Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, permissões, endpoint NestJS e chamada frontend.

O guia é autocontido para o aluno: inclui o código necessário para este BK, explica o objetivo de cada bloco e define resultados esperados para sucesso e falha.

## Porque é que isto é importante
A `MF1` liga o estudo individual da `MF0` a contextos com salas, turmas, disciplinas e professores. Estes contextos aumentam o risco de fuga de dados se o backend confiar em IDs enviados pelo cliente.

A regra base deste BK é simples: a sessão identifica o ator, o service confirma o contexto, e só depois a aplicação lê, escreve ou chama IA.

## O que entra (scope)
- Criar perfil pedagógico por aluno e área de estudo.
- Aplicar ritmo, nível e dificuldades ao prompt.
- Usar apenas materiais processáveis da área do aluno.
- Bloquear resposta se não existirem fontes.

## O que não entra (scope-out)
- Diagnóstico psicológico.
- IA de turma ou sala.
- Novo motor de embeddings/RAG.

## Como saber que isto ficou bem
- Aluno atualiza perfil.
- Explicação adapta linguagem e ritmo.
- Sem fontes devolve `422`.
- Outro aluno não acede ao perfil.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-01` (CANONICO)
- Requisito: `RF13` (CANONICO)
- Ator principal: aluno autenticado (DERIVADO)
- Endpoint principal: `POST /api/ai/adapted-explanations` (DERIVADO)
- Persistência principal: `student_learning_profiles` (DERIVADO)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF0-07` para áreas de estudo.
- `BK-MF0-11` e `BK-MF0-12` para IA individual baseada em fontes.

## Glossário rápido
- `Ownership`: regra que limita acesso ao dono ou ao contexto autorizado.
- `Membership`: pertença a turma ou sala usada para autorizar acesso.
- `DTO`: validação de entrada antes do service.
- `Fonte oficial/processável`: conteúdo permitido para fundamentar resposta da IA.
- `Guardrail`: regra que impede a IA de responder fora do contexto autorizado.

## Conceitos teóricos essenciais
- Adaptar não significa inventar. A IA muda forma, exemplos e ritmo, mas os factos vêm das fontes.
- Dificuldades do aluno são dados sensíveis e devem ficar limitadas ao próprio aluno.
- O ownership da área de estudo é obrigatório antes de carregar materiais.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/ai/schemas/student-learning-profile.schema.ts
apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
apps/api/src/modules/ai/dto/adapted-explanation.dto.ts
apps/api/src/modules/ai/services/adaptive-learning.service.ts
apps/api/src/modules/ai/controllers/adaptive-learning.controller.ts
apps/web/src/lib/adaptiveLearningApi.ts
```

### Sequência do fluxo
1. Aluno escolhe área, ritmo, nível e dificuldades.
2. Service confirma que a área pertence ao aluno.
3. Perfil é guardado por `userId + studyAreaId`.
4. Service carrega materiais processáveis da área.
5. Provider responde com fontes e perfil pedagógico.

### Riscos técnicos a controlar
- Expor dificuldades do aluno a outros utilizadores.
- Responder sem fontes.
- Aceitar `userId` no body.

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
import { ArrayMaxSize, IsArray, IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export type StudentLearningProfileDocument = HydratedDocument<StudentLearningProfile>;
@Schema({ timestamps: true, collection: 'student_learning_profiles' })
export class StudentLearningProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'StudyArea', required: true, index: true }) studyAreaId!: Types.ObjectId;
  @Prop({ enum: ['SLOW', 'NORMAL', 'FAST'], default: 'NORMAL' }) pace!: 'SLOW' | 'NORMAL' | 'FAST';
  @Prop({ enum: ['BASIC', 'INTERMEDIATE', 'ADVANCED'], default: 'INTERMEDIATE' }) level!: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  @Prop({ type: [String], default: [] }) difficulties!: string[];
}
export const StudentLearningProfileSchema = SchemaFactory.createForClass(StudentLearningProfile);
StudentLearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });
export class UpdateLearningProfileDto {
  @IsMongoId() studyAreaId!: string;
  @IsEnum(['SLOW', 'NORMAL', 'FAST']) pace!: 'SLOW' | 'NORMAL' | 'FAST';
  @IsEnum(['BASIC', 'INTERMEDIATE', 'ADVANCED']) level!: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(80, { each: true }) difficulties?: string[];
}
export class AdaptedExplanationDto { @IsMongoId() studyAreaId!: string; @IsString() @MinLength(3) @MaxLength(1000) question!: string; }
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
import { StudyArea, StudyAreaDocument } from '../../study-areas/schemas/study-area.schema';
import { StudyMaterial, StudyMaterialDocument } from '../../study-materials/schemas/study-material.schema';
import { AiProvider } from '../providers/ai.provider';
import { AdaptedExplanationDto, UpdateLearningProfileDto, StudentLearningProfile, StudentLearningProfileDocument } from '../schemas/student-learning-profile.schema';
@Injectable()
export class AdaptiveLearningService {
  constructor(@InjectModel(StudentLearningProfile.name) private readonly profileModel: Model<StudentLearningProfileDocument>, @InjectModel(StudyArea.name) private readonly areaModel: Model<StudyAreaDocument>, @InjectModel(StudyMaterial.name) private readonly materialModel: Model<StudyMaterialDocument>, private readonly aiProvider: AiProvider) {}
  async updateProfile(actor: AuthenticatedUser, dto: UpdateLearningProfileDto) { this.assertStudent(actor); await this.findOwnedArea(actor.id, dto.studyAreaId); const profile = await this.profileModel.findOneAndUpdate({ userId: new Types.ObjectId(actor.id), studyAreaId: new Types.ObjectId(dto.studyAreaId) }, { pace: dto.pace, level: dto.level, difficulties: (dto.difficulties ?? []).map((d) => d.trim()).filter(Boolean) }, { new: true, upsert: true, setDefaultsOnInsert: true }); return { id: profile._id.toString(), pace: profile.pace, level: profile.level, difficulties: profile.difficulties }; }
  async explain(actor: AuthenticatedUser, dto: AdaptedExplanationDto) { this.assertStudent(actor); await this.findOwnedArea(actor.id, dto.studyAreaId); const profile = await this.profileModel.findOne({ userId: new Types.ObjectId(actor.id), studyAreaId: new Types.ObjectId(dto.studyAreaId) }); const sources = await this.materialModel.find({ studyAreaId: new Types.ObjectId(dto.studyAreaId), ownerId: new Types.ObjectId(actor.id), status: 'PROCESSED' }).limit(6).lean(); if (!sources.length) throw new UnprocessableEntityException('Adiciona materiais processáveis antes de pedir uma explicação.'); const answer = await this.aiProvider.answer({ system: this.prompt(profile), user: dto.question.trim(), sources: sources.map((s) => ({ id: s._id.toString(), title: s.title, text: s.extractedText })) }); return { answer: answer.text, sourcesUsed: answer.sourcesUsed }; }
  private async findOwnedArea(userId: string, studyAreaId: string) { const area = await this.areaModel.findOne({ _id: new Types.ObjectId(studyAreaId), ownerId: new Types.ObjectId(userId) }); if (!area) throw new NotFoundException('Área de estudo não encontrada.'); return area; }
  private assertStudent(actor: AuthenticatedUser) { if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos podem configurar adaptação individual.'); }
  private prompt(profile: StudentLearningProfileDocument | null) { return ['Responde apenas com base nas fontes.', `Ritmo: ${profile?.pace ?? 'NORMAL'}.`, `Nível: ${profile?.level ?? 'INTERMEDIATE'}.`, `Dificuldades: ${profile?.difficulties?.join(', ') || 'sem registo'}.`].join('\\n'); }
}
```

Explicação do código:
- A autorização acontece antes de carregar dados sensíveis.
- As queries filtram por professor, aluno, turma, disciplina ou sala, consoante o BK.
- Quando existe IA, o provider recebe apenas fontes autorizadas.
- Não há chamadas para métodos externos por implementar neste BK.

### Passo 4 - Criar controller e módulo
```ts
import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AdaptedExplanationDto, UpdateLearningProfileDto } from '../schemas/student-learning-profile.schema';
import { AdaptiveLearningService } from '../services/adaptive-learning.service';
@UseGuards(SessionGuard)
@Controller('api/ai')
export class AdaptiveLearningController {
  constructor(private readonly service: AdaptiveLearningService) {}
  @Put('learning-profile') update(@Req() request: Request, @Body() dto: UpdateLearningProfileDto) { return this.service.updateProfile(request.user, dto); }
  @Post('adapted-explanations') explain(@Req() request: Request, @Body() dto: AdaptedExplanationDto) { return this.service.explain(request.user, dto); }
}
```

Explicação do código:
- `SessionGuard` obriga sessão válida.
- `request.user` é a identidade confiável.
- O controller não recebe `userId`, `teacherId` ou `studentId` no body.
- O módulo regista schemas e provider necessários para o service.

### Passo 5 - Criar cliente frontend
```tsx
export type UpdateLearningProfilePayload = { studyAreaId: string; pace: 'SLOW' | 'NORMAL' | 'FAST'; level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'; difficulties: string[] };
export type AdaptedExplanationPayload = { studyAreaId: string; question: string };
export async function requestAdaptedExplanation(payload: AdaptedExplanationPayload) {
  const response = await fetch('/api/ai/adapted-explanations', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Não foi possível gerar explicação adaptada.');
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
- Perfil atualizado por aluno/área.
- Explicação devolve `answer` e `sourcesUsed`.

Cenários negativos:
- Área de outro aluno recebe `404`.
- Sem fontes recebe `422`.
- Pergunta vazia recebe `400`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

## Evidência de conclusão
- Resposta do perfil.
- Resposta da IA com fontes.
- Teste negativo de ownership.

## Handoff para o próximo BK
- `BK-MF1-04` e `BK-MF1-11` reutilizam a regra de IA limitada a fontes.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código completo para schema, DTO, service, controller/módulo e frontend.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
