# BK-MF1-04 - IA partilhada da sala (mistura das áreas dos membros).

## Header
- `doc_id`: `GUIA-BK-MF1-04`
- `bk_id`: `BK-MF1-04`
- `macro`: `MF1`
- `owner`: `Daniel`
- `apoio`: `Kaua`
- `prioridade`: `P2`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF16`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-07`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-04-ia-partilhada-da-sala-mistura-das-areas-dos-membros.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF16`: IA partilhada da sala (mistura das áreas dos membros). Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, regras de permissão, endpoint NestJS e chamada no frontend.

O guia está escrito para ser seguido por alunos: cada bloco de código tem uma finalidade concreta, não depende de funções escondidas e indica como validar o comportamento esperado.

## Porque é que isto é importante
A `MF1` acrescenta colaboração e contexto partilhado ao StudyFlow. A partir daqui, já não basta guardar dados: é preciso provar que cada aluno ou professor só acede ao contexto certo.

Neste BK, a regra mais importante é: a identidade vem da sessão autenticada e o contexto é confirmado no backend. O frontend ajuda a experiência, mas nunca é a autoridade de segurança.

## O que entra (scope)
- Responder com IA usando apenas partilhas processáveis da sala.
- Confirmar membership do aluno.
- Guardar pergunta, resposta e fontes usadas.
- Bloquear resposta sem fontes.

## O que não entra (scope-out)
- Materiais privados não partilhados.
- Chat em tempo real.
- Voz docente oficial.

## Como saber que isto ficou bem
- Membro recebe resposta com fontes.
- Não membro não acede.
- Sem fontes devolve `422`.
- Resposta não usa dados fora da sala.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-04` (CANONICO)
- Requisito: `RF16` (CANONICO)
- Ator principal: aluno membro da sala (DERIVADO)
- Endpoint principal: `POST /api/study-rooms/:roomId/ai/answers` (DERIVADO)
- Persistência principal: `room_ai_requests` (DERIVADO)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF1-02` e `BK-MF1-03` concluídos.

## Glossário rápido
- `Ownership`: garantia de que um utilizador só acede ao seu contexto.
- `Membership`: garantia de que um aluno pertence a uma sala ou turma antes de ver dados desse contexto.
- `DTO`: classe que valida o body antes do service.
- `Fonte processável`: conteúdo que pode alimentar IA sem inventar informação.
- `IDOR`: falha em que trocar um ID no pedido permite aceder a dados de outra pessoa.

## Conceitos teóricos essenciais
- IA partilhada só é segura se a fronteira da sala for respeitada.
- A resposta deve devolver IDs das fontes usadas para validação.
- Sem fontes, a ação correta é recusar; não inventar.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/study-rooms/schemas/room-ai-request.schema.ts
apps/api/src/modules/study-rooms/dto/ask-room-ai.dto.ts
apps/api/src/modules/study-rooms/services/room-ai.service.ts
apps/api/src/modules/study-rooms/controllers/room-ai.controller.ts
apps/web/src/lib/roomAiApi.ts
```

### Sequência do fluxo
1. Aluno pergunta dentro da sala.
2. Service confirma membership.
3. Service carrega `RoomShare` processáveis.
4. Provider recebe apenas essas fontes.
5. Interação é guardada com `sourceIds`.

### Riscos técnicos a controlar
- Responder sem fontes.
- Usar materiais privados.
- Guardar resposta sem fontes usadas.

## Guia linear de implementação

### Passo 1 - Confirmar contrato e dependências
Confirma o header, o requisito funcional e as dependências. Se uma dependência ainda não existir no projeto real, implementa-a primeiro ou mantém o BK bloqueado; não inventes um atalho no endpoint.

Validação deste passo:
- O endpoint usa o ator correto: aluno em `/api/study-rooms` ou `/api/student`, professor em `/api/teacher`.
- O service sabe verificar ownership ou membership no backend.
- Não há campos de identidade confiável no body.

### Passo 2 - Criar modelo e DTO
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IsString, MaxLength, MinLength } from 'class-validator';
export type RoomAiRequestDocument = HydratedDocument<RoomAiRequest>;
@Schema({ timestamps: true, collection: 'room_ai_requests' })
export class RoomAiRequest {
  @Prop({ type: Types.ObjectId, ref: 'StudyRoom', required: true, index: true }) roomId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) askedById!: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 1000 }) question!: string;
  @Prop({ required: true, trim: true }) answer!: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'RoomShare' }], default: [] }) sourceIds!: Types.ObjectId[];
}
export const RoomAiRequestSchema = SchemaFactory.createForClass(RoomAiRequest);
export class AskRoomAiDto { @IsString() @MinLength(3) @MaxLength(1000) question!: string; }
```

Explicação do código:
- O schema guarda o mínimo necessário para o requisito.
- Os índices acompanham as queries que o service vai executar.
- O DTO valida forma e tamanho antes de chegar à base de dados.
- IDs de dono, autor ou aluno autenticado são derivados da sessão.

### Passo 3 - Criar service completo
```ts
import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { AiProvider } from '../../ai/providers/ai.provider';
import { AskRoomAiDto } from '../dto/ask-room-ai.dto';
import { RoomAiRequest, RoomAiRequestDocument } from '../schemas/room-ai-request.schema';
import { RoomShare, RoomShareDocument } from '../schemas/room-share.schema';
import { StudyRoom, StudyRoomDocument } from '../schemas/study-room.schema';
@Injectable()
export class RoomAiService {
  constructor(@InjectModel(RoomAiRequest.name) private readonly requestModel: Model<RoomAiRequestDocument>, @InjectModel(RoomShare.name) private readonly shareModel: Model<RoomShareDocument>, @InjectModel(StudyRoom.name) private readonly roomModel: Model<StudyRoomDocument>, private readonly aiProvider: AiProvider) {}
  async answer(actor: AuthenticatedUser, roomId: string, dto: AskRoomAiDto) {
    this.assertStudent(actor);
    const room = await this.findRoomForMember(actor.id, roomId);
    const sources = await this.shareModel.find({ roomId: room._id, processableForAi: true, content: { $ne: '' } }).sort({ createdAt: -1 }).limit(8).lean();
    if (!sources.length) throw new UnprocessableEntityException('A sala ainda não tem fontes processáveis.');
    const aiAnswer = await this.aiProvider.answer({ system: 'Responde apenas com base nas fontes partilhadas nesta sala.', user: dto.question.trim(), sources: sources.map((source) => ({ id: source._id.toString(), title: source.title, text: source.content })) });
    const saved = await this.requestModel.create({ roomId: room._id, askedById: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: aiAnswer.text, sourceIds: aiAnswer.sourcesUsed.map((id) => new Types.ObjectId(id)) });
    return { id: saved._id.toString(), answer: saved.answer, sourcesUsed: saved.sourceIds.map((id) => id.toString()) };
  }
  private async findRoomForMember(userId: string, roomId: string) { const room = await this.roomModel.findOne({ _id: new Types.ObjectId(roomId), memberIds: new Types.ObjectId(userId) }); if (!room) throw new NotFoundException('Sala não encontrada para este aluno.'); return room; }
  private assertStudent(actor: AuthenticatedUser) { if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos membros podem usar a IA da sala.'); }
}
```

Explicação do código:
- A autorização acontece antes da leitura ou escrita principal.
- A query de contexto usa membership ou ownership, não apenas `_id`.
- Não há métodos por implementar fora do ficheiro mostrado.
- As exceções devolvem estados previsíveis para a UI e para os testes.

### Passo 4 - Criar controller e módulo
```ts
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AskRoomAiDto } from '../dto/ask-room-ai.dto';
import { RoomAiService } from '../services/room-ai.service';
@UseGuards(SessionGuard)
@Controller('api/study-rooms/:roomId/ai')
export class RoomAiController {
  constructor(private readonly service: RoomAiService) {}
  @Post('answers') answer(@Req() request: Request, @Param('roomId') roomId: string, @Body() dto: AskRoomAiDto) { return this.service.answer(request.user, roomId, dto); }
}
```

Explicação do código:
- `SessionGuard` garante sessão válida.
- `request.user` é a identidade confiável.
- `@Param` identifica o contexto, mas só o service decide se o ator pode usá-lo.
- O módulo regista os schemas necessários ao service.

### Passo 5 - Criar cliente frontend
```tsx
export type AskRoomAiPayload = { question: string };
export type RoomAiAnswerView = { id: string; answer: string; sourcesUsed: string[] };
export async function askRoomAi(roomId: string, payload: AskRoomAiPayload): Promise<RoomAiAnswerView> {
  const response = await fetch(`/api/study-rooms/${roomId}/ai/answers`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('A sala precisa de fontes partilhadas para responder.');
  return response.json() as Promise<RoomAiAnswerView>;
}
```

Explicação do código:
- A chamada usa `credentials: 'include'` para enviar o cookie HttpOnly.
- O payload tem tipo explícito.
- A UI mostra erro seguro, sem revelar stack trace.
- O backend continua a validar tudo, mesmo que o frontend bloqueie campos vazios.

### Passo 6 - Validar caminho principal e negativos
Caminho principal:
- Membro pergunta e recebe `answer` com `sourcesUsed`.
- Fontes usadas pertencem à sala.

Cenários negativos:
- Sala sem fontes recebe `422`.
- Não membro recebe `404`.
- Professor recebe `403`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

## Evidência de conclusão
- Resposta com fontes.
- Teste provando que fonte privada fora da sala não entra.

## Handoff para o próximo BK
- `BK-MF1-11` aplica a mesma disciplina de fontes em contexto oficial de turma.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código do BK completo nos ficheiros indicados.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos documentados com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
