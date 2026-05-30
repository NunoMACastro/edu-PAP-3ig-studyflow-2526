# BK-MF1-03 - Partilhar materiais e apontamentos na sala.

## Header
- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Guilherme`
- `apoio`: `Natalia`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-02`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-partilhar-materiais-e-apontamentos-na-sala.md`
- `last_updated`: `2026-05-30`

## O que vamos fazer neste BK
Este BK implementa `RF15`: Partilhar materiais e apontamentos na sala. Vamos construir a funcionalidade de ponta a ponta, com contrato de dados, validação, regras de permissão, endpoint NestJS e chamada no frontend.

O guia está escrito para ser seguido por alunos: cada bloco de código tem uma finalidade concreta, não depende de funções escondidas e indica como validar o comportamento esperado.

## Porque é que isto é importante
A `MF1` acrescenta colaboração e contexto partilhado ao StudyFlow. A partir daqui, já não basta guardar dados: é preciso provar que cada aluno ou professor só acede ao contexto certo.

Neste BK, a regra mais importante é: a identidade vem da sessão autenticada e o contexto é confirmado no backend. O frontend ajuda a experiência, mas nunca é a autoridade de segurança.

## O que entra (scope)
- Criar partilhas de nota, URL ou referência a material.
- Confirmar que o autor é membro da sala.
- Listar partilhas apenas para membros.
- Marcar conteúdos que podem alimentar IA.

## O que não entra (scope-out)
- Upload pesado de ficheiros.
- OCR ou extração de texto.
- Resposta da IA da sala.

## Como saber que isto ficou bem
- Membro cria partilha.
- Não membro não lista nem cria.
- Partilhas processáveis ficam identificadas.
- Autor vem da sessão.

## Metadados do BK (CANONICO/DERIVADO)
- BK: `BK-MF1-03` (CANONICO)
- Requisito: `RF15` (CANONICO)
- Ator principal: aluno membro da sala (DERIVADO)
- Endpoint principal: `POST /api/study-rooms/:roomId/shares` (DERIVADO)
- Persistência principal: `room_shares` (DERIVADO)
- Fonte de verdade: `docs/RF.md` e `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` (CANONICO)

## Pre-leitura mínima
- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `BK-MF1-02` concluído.

## Glossário rápido
- `Ownership`: garantia de que um utilizador só acede ao seu contexto.
- `Membership`: garantia de que um aluno pertence a uma sala ou turma antes de ver dados desse contexto.
- `DTO`: classe que valida o body antes do service.
- `Fonte processável`: conteúdo que pode alimentar IA sem inventar informação.
- `IDOR`: falha em que trocar um ID no pedido permite aceder a dados de outra pessoa.

## Conceitos teóricos essenciais
- Partilhar numa sala não torna o material público.
- A membership da sala limita leitura e escrita.
- A flag `processableForAi` prepara o BK seguinte.

## Arquitetura final deste BK
### Ficheiros a criar ou editar
```text
apps/api/src/modules/study-rooms/schemas/room-share.schema.ts
apps/api/src/modules/study-rooms/dto/create-room-share.dto.ts
apps/api/src/modules/study-rooms/services/room-shares.service.ts
apps/api/src/modules/study-rooms/controllers/room-shares.controller.ts
apps/web/src/lib/roomSharesApi.ts
```

### Sequência do fluxo
1. Aluno abre sala.
2. Backend confirma membership.
3. Partilha é criada com `authorId` da sessão.
4. Listagem devolve partilhas da sala.

### Riscos técnicos a controlar
- Listar partilhas sem confirmar membership.
- Aceitar `authorId` no body.
- Marcar URL externa como fonte processável sem ingestão.

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
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export type RoomShareDocument = HydratedDocument<RoomShare>;
@Schema({ timestamps: true, collection: 'room_shares' })
export class RoomShare {
  @Prop({ type: Types.ObjectId, ref: 'StudyRoom', required: true, index: true }) roomId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) authorId!: Types.ObjectId;
  @Prop({ enum: ['NOTE', 'URL', 'MATERIAL_REFERENCE'], required: true }) type!: 'NOTE' | 'URL' | 'MATERIAL_REFERENCE';
  @Prop({ required: true, trim: true, maxlength: 160 }) title!: string;
  @Prop({ required: true, trim: true, maxlength: 4000 }) content!: string;
  @Prop({ default: false }) processableForAi!: boolean;
}
export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
export class CreateRoomShareDto {
  @IsEnum(['NOTE', 'URL', 'MATERIAL_REFERENCE']) type!: 'NOTE' | 'URL' | 'MATERIAL_REFERENCE';
  @IsString() @MinLength(2) @MaxLength(160) title!: string;
  @IsString() @MinLength(2) @MaxLength(4000) content!: string;
  @IsOptional() @IsBoolean() processableForAi?: boolean;
}
```

Explicação do código:
- O schema guarda o mínimo necessário para o requisito.
- Os índices acompanham as queries que o service vai executar.
- O DTO valida forma e tamanho antes de chegar à base de dados.
- IDs de dono, autor ou aluno autenticado são derivados da sessão.

### Passo 3 - Criar service completo
```ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CreateRoomShareDto } from '../dto/create-room-share.dto';
import { RoomShare, RoomShareDocument } from '../schemas/room-share.schema';
import { StudyRoom, StudyRoomDocument } from '../schemas/study-room.schema';
@Injectable()
export class RoomSharesService {
  constructor(@InjectModel(RoomShare.name) private readonly shareModel: Model<RoomShareDocument>, @InjectModel(StudyRoom.name) private readonly roomModel: Model<StudyRoomDocument>) {}
  async create(actor: AuthenticatedUser, roomId: string, dto: CreateRoomShareDto) {
    this.assertStudent(actor);
    const room = await this.findRoomForMember(actor.id, roomId);
    const share = await this.shareModel.create({ roomId: room._id, authorId: new Types.ObjectId(actor.id), type: dto.type, title: dto.title.trim(), content: dto.content.trim(), processableForAi: Boolean(dto.processableForAi && dto.type === 'NOTE') });
    return this.toView(share);
  }
  async list(actor: AuthenticatedUser, roomId: string) { await this.findRoomForMember(actor.id, roomId); const shares = await this.shareModel.find({ roomId: new Types.ObjectId(roomId) }).sort({ createdAt: -1 }).lean(); return shares.map((share) => this.toView(share)); }
  private async findRoomForMember(userId: string, roomId: string) { const room = await this.roomModel.findOne({ _id: new Types.ObjectId(roomId), memberIds: new Types.ObjectId(userId) }); if (!room) throw new NotFoundException('Sala não encontrada para este aluno.'); return room; }
  private assertStudent(actor: AuthenticatedUser) { if (actor.role !== 'STUDENT') throw new ForbiddenException('Apenas alunos podem partilhar na sala.'); }
  private toView(share: RoomShareDocument | RoomShare & { _id: Types.ObjectId }) { return { id: share._id.toString(), roomId: share.roomId.toString(), title: share.title, type: share.type, content: share.content, processableForAi: share.processableForAi }; }
}
```

Explicação do código:
- A autorização acontece antes da leitura ou escrita principal.
- A query de contexto usa membership ou ownership, não apenas `_id`.
- Não há métodos por implementar fora do ficheiro mostrado.
- As exceções devolvem estados previsíveis para a UI e para os testes.

### Passo 4 - Criar controller e módulo
```ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CreateRoomShareDto } from '../dto/create-room-share.dto';
import { RoomSharesService } from '../services/room-shares.service';
@UseGuards(SessionGuard)
@Controller('api/study-rooms/:roomId/shares')
export class RoomSharesController {
  constructor(private readonly service: RoomSharesService) {}
  @Post() create(@Req() request: Request, @Param('roomId') roomId: string, @Body() dto: CreateRoomShareDto) { return this.service.create(request.user, roomId, dto); }
  @Get() list(@Req() request: Request, @Param('roomId') roomId: string) { return this.service.list(request.user, roomId); }
}
```

Explicação do código:
- `SessionGuard` garante sessão válida.
- `request.user` é a identidade confiável.
- `@Param` identifica o contexto, mas só o service decide se o ator pode usá-lo.
- O módulo regista os schemas necessários ao service.

### Passo 5 - Criar cliente frontend
```tsx
export type CreateRoomSharePayload = { type: 'NOTE' | 'URL' | 'MATERIAL_REFERENCE'; title: string; content: string; processableForAi?: boolean };
export async function createRoomShare(roomId: string, payload: CreateRoomSharePayload) {
  const response = await fetch(`/api/study-rooms/${roomId}/shares`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Não foi possível partilhar na sala.');
  return response.json();
}
```

Explicação do código:
- A chamada usa `credentials: 'include'` para enviar o cookie HttpOnly.
- O payload tem tipo explícito.
- A UI mostra erro seguro, sem revelar stack trace.
- O backend continua a validar tudo, mesmo que o frontend bloqueie campos vazios.

### Passo 6 - Validar caminho principal e negativos
Caminho principal:
- Membro cria partilha e recebe `201 Created`.
- Membro lista partilhas da sala.

Cenários negativos:
- Não membro recebe `404 Not Found`.
- Professor recebe `403 Forbidden`.
- Conteúdo vazio recebe `400 Bad Request`.

Comandos úteis:
```bash
npm run test:unit
npm run test:integration
npm run test:contracts
bash scripts/validate-planificacao.sh
```

## Evidência de conclusão
- Resposta de criação com `authorId` derivado da sessão.
- Listagem testada com membro e não membro.

## Handoff para o próximo BK
- `BK-MF1-04` usa apenas partilhas com `processableForAi: true`.

## Checklist final
- [ ] Header preservado sem alterar campos canónicos.
- [ ] Código do BK completo nos ficheiros indicados.
- [ ] Sem funções por implementar nem payloads sem tipo.
- [ ] Caminho principal e negativos documentados com expected results.
- [ ] Validação executada ou bloqueio registado com erro exato.

## Changelog
- `2026-04-19`: guia semântico inicial alinhado ao requisito.
- `2026-05-30`: guia reescrito como tutorial guiado para alunos, com código completo do BK e validação objetiva.
