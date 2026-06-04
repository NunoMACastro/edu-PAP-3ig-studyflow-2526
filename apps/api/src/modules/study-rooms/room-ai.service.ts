// apps/api/src/modules/study-rooms/room-ai.service.ts
import {
    ForbiddenException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { AskRoomAiDto } from "./dto/ask-room-ai.dto";
import { buildRoomAiPrompt } from "./prompts/room-ai.prompt";
import { RoomSharesService } from "./room-shares.service";
import { RoomAiInteraction, RoomAiInteractionDocument } from "./schemas/room-ai-interaction.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
export class RoomAiService {
    constructor(
        @InjectModel(RoomAiInteraction.name)
        private readonly interactionModel: Model<RoomAiInteractionDocument>,
        private readonly studyRoomsService: StudyRoomsService,
        private readonly roomSharesService: RoomSharesService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async answer(actor: AuthenticatedUser, roomId: string, dto: AskRoomAiDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const shares = await this.roomSharesService.findUsableSharesForRoom(
            room._id.toString(),
            dto.sourceIds ?? [],
        );

        if (shares.length === 0) {
            throw new UnprocessableEntityException("A sala ainda não tem fontes textuais partilhadas.");
        }

        const prompt = buildRoomAiPrompt(dto.question.trim(), shares);

        let result: Record<string, unknown>;
        try {
            result = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const { answer, sources } = this.normalizeAiResult(result, shares);

        const interaction = await this.interactionModel.create({
            roomId: room._id,
            studentId: new Types.ObjectId(actor.id),
            question: dto.question.trim(),
            answer,
            sources,
        });

        return {
            id: interaction._id.toString(),
            answer: interaction.answer,
            sources: interaction.sources,
        };
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos membros podem usar a IA da sala.");
        }
    }

    private normalizeAiResult(result: Record<string, unknown>, shares: Array<{ _id: Types.ObjectId; title: string }>) {
        const answer = typeof result.answer === "string" ? result.answer.trim() : "";
        if (!answer) {
            throw new ServiceUnavailableException("A IA devolveu uma resposta inválida.");
        }

        const allowedSources = new Map(
            shares.map((share) => [
                share._id.toString(),
                { shareId: share._id.toString(), title: share.title },
            ]),
        );
        const rawSourceIds = Array.isArray(result.sourceShareIds) ? result.sourceShareIds : [];
        const sources = rawSourceIds
            .filter((sourceId): sourceId is string => typeof sourceId === "string")
            .map((sourceId) => allowedSources.get(sourceId))
            .filter((source): source is { shareId: string; title: string } => Boolean(source));

        if (sources.length === 0) {
            throw new ServiceUnavailableException("A IA devolveu fontes inválidas.");
        }

        return { answer, sources };
    }
}