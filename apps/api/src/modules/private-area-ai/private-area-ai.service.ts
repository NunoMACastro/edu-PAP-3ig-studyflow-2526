import {
    ForbiddenException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider, PrivateAreaAiResult } from "../ai/providers/ai-provider.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AskPrivateAreaAiDto } from "./dto/ask-private-area-ai.dto.js";
import { buildPrivateAreaAiPrompt } from "./prompts/private-area-ai.prompt.js";
import {
    PrivateAreaAiAnswer,
    PrivateAreaAiAnswerDocument,
} from "./schemas/private-area-ai-answer.schema.js";

/**
 * Serviço de IA privada por área de estudo.
 */
@Injectable()
export class PrivateAreaAiService {
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answerModel: Model<PrivateAreaAiAnswerDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
    ) {}

    async ask(
        actor: AuthenticatedUser,
        studyAreaId: string,
        input: AskPrivateAreaAiDto,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const area = await this.studyAreasService.getMyStudyArea(
            actor.id,
            studyAreaId,
        );
        const materials = await this.materialsService.listReadyTextSources(
            actor.id,
            studyAreaId,
        );
        const sources = materials.map((material) => ({
            materialId: String(material._id),
            title: material.title,
            contentText: material.contentText ?? "",
        }));
        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PRIVATE_AI_SOURCES",
                message: "Esta área ainda não tem materiais processáveis para IA.",
            });
        }

        try {
            const result = await this.aiProvider.generatePrivateAreaAnswer({
                prompt: buildPrivateAreaAiPrompt({
                    areaName: area.name,
                    question: input.question.trim(),
                    sources,
                }),
            });
            this.validateResult(result, sources.map((source) => source.materialId));

            const answer = await this.answerModel.create({
                studyAreaId: new Types.ObjectId(studyAreaId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            return {
                _id: String(answer._id),
                studyAreaId,
                question: answer.question,
                answer: answer.answer,
                sources: sources.filter((source) =>
                    result.sourceMaterialIds.includes(source.materialId),
                ),
                createdAt: (answer.toObject() as { createdAt?: Date }).createdAt,
            };
        } catch (error) {
            if (
                error instanceof GatewayTimeoutException ||
                error instanceof ServiceUnavailableException ||
                error instanceof UnprocessableEntityException
            ) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    private validateResult(result: PrivateAreaAiResult, allowedIds: string[]): void {
        const allowed = new Set(allowedIds);
        if (
            typeof result.answer !== "string" ||
            !result.answer.trim() ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((sourceId) => !allowed.has(sourceId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_PRIVATE_ANSWER",
                message: "A IA devolveu uma resposta inválida para a área.",
            });
        }
    }
}
