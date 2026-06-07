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
import { AI_PROVIDER, AiProvider, ClassAiResult } from "../ai/providers/ai-provider.js";
import { OfficialMaterialView, OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service.js";
import { AskClassAiDto } from "./dto/ask-class-ai.dto.js";
import { buildClassAiPrompt } from "./prompts/class-ai.prompt.js";
import {
    ClassAiInteraction,
    ClassAiInteractionDocument,
} from "./schemas/class-ai-interaction.schema.js";

/**
 * Serviço da IA limitada por disciplina/turma.
 */
@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly subjectsService: SubjectsService,
        private readonly materialsService: OfficialMaterialsService,
        private readonly voiceService: TeacherAiVoiceService,
    ) {}

    async askClassAi(
        actor: AuthenticatedUser,
        subjectId: string,
        input: AskClassAiDto,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        const { subject, schoolClass } =
            await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.materialsService.listProcessedForSubject(
            subject._id,
        );
        if (materials.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_OFFICIAL_AI_SOURCES",
                message:
                    "Esta disciplina ainda não tem materiais oficiais processados para IA.",
            });
        }

        const voice = await this.voiceService.findVoiceForSubject(subject._id);

        try {
            const result = await this.aiProvider.generateClassAnswer({
                prompt: buildClassAiPrompt({
                    subjectName: subject.name,
                    question: input.question.trim(),
                    materials,
                    voice,
                }),
            });
            this.validateResult(result, materials);

            const interaction = await this.interactionModel.create({
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(schoolClass._id),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
            });

            const created = interaction.toObject() as { createdAt?: Date };
            return {
                _id: String(interaction._id),
                subjectId: subject._id,
                classId: schoolClass._id,
                question: interaction.question,
                answer: interaction.answer,
                sources: materials.filter((material) =>
                    result.sourceMaterialIds.includes(material._id),
                ),
                createdAt: created.createdAt,
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

    private validateResult(
        result: ClassAiResult,
        materials: OfficialMaterialView[],
    ): void {
        const allowedIds = new Set(materials.map((material) => material._id));
        if (
            typeof result.answer !== "string" ||
            result.answer.trim().length === 0 ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((materialId) => !allowedIds.has(materialId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_CLASS_ANSWER",
                message: "A IA devolveu uma resposta inválida para a disciplina.",
            });
        }
    }
}
