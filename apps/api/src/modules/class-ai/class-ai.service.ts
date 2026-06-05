// apps/api/src/modules/class-ai/class-ai.service.ts
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
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";
import { buildClassAiPrompt } from "./prompts/class-ai.prompt";
import {
    ClassAiInteraction,
    ClassAiInteractionDocument,
} from "./schemas/class-ai-interaction.schema";

@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly teacherAiVoiceService: TeacherAiVoiceService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async answer(actor: AuthenticatedUser, subjectId: string, dto: AskClassAiDto) {
        this.assertStudent(actor);

        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta disciplina ainda não tem materiais oficiais processados.",
            );
        }

        const voice = await this.teacherAiVoiceService.findForSubject(subject);
        const prompt = buildClassAiPrompt({
            question: dto.question.trim(),
            materials,
            voice,
        });

        let result: Record<string, unknown>;
        try {
            result = await this.aiProvider.generateStudyTool({
                prompt,
                type: "EXPLANATION",
            });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const { answer, sources } = this.normalizeAiResult(result, materials);

        const interaction = await this.interactionModel.create({
            studentId: new Types.ObjectId(actor.id),
            classId: subject.classId,
            subjectId: subject._id,
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
            throw new ForbiddenException("Apenas alunos inscritos podem usar a IA da disciplina.");
        }
    }

    private normalizeAiResult(result: Record<string, unknown>, materials: Array<{ _id: Types.ObjectId; title: string }>) {
        const answer = typeof result.answer === "string" ? result.answer.trim() : "";
        if (!answer) {
            throw new ServiceUnavailableException("A IA devolveu uma resposta inválida.");
        }

        const allowedSources = new Map(
            materials.map((material) => [
                material._id.toString(),
                { materialId: material._id.toString(), title: material.title },
            ]),
        );
        const rawSourceIds = Array.isArray(result.sourceMaterialIds)
            ? result.sourceMaterialIds
            : [];
        const sources = rawSourceIds
            .filter((sourceId): sourceId is string => typeof sourceId === "string")
            .map((sourceId) => allowedSources.get(sourceId))
            .filter((source): source is { materialId: string; title: string } => Boolean(source));

        if (sources.length === 0) {
            throw new ServiceUnavailableException("A IA devolveu fontes inválidas.");
        }

        return { answer, sources };
    }
}