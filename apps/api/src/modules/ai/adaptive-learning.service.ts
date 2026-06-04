// apps/api/src/modules/ai/adaptive-learning.service.ts
import {
    Inject,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Material, MaterialDocument } from "../materials/schemas/material.schema";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";
import { AI_PROVIDER, AiProvider } from "./providers/ai-provider";
import { buildAdaptiveExplanationPrompt } from "./prompts/adaptive-explanation.prompt";
import {
    AdaptiveExplanation,
    AdaptiveExplanationDocument,
} from "./schemas/adaptive-explanation.schema";
import { LearningProfile, LearningProfileDocument } from "./schemas/learning-profile.schema";

@Injectable()
export class AdaptiveLearningService {
    constructor(
        @InjectModel(LearningProfile.name)
        private readonly profileModel: Model<LearningProfileDocument>,
        @InjectModel(AdaptiveExplanation.name)
        private readonly explanationModel: Model<AdaptiveExplanationDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        @Inject(AI_PROVIDER)
        private readonly aiProvider: AiProvider,
    ) {}

    async getProfile(userId: string, studyAreaId: string) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        return profile ? this.toProfileView(profile) : this.defaultProfile(studyAreaId);
    }

    async updateProfile(userId: string, studyAreaId: string, dto: UpdateLearningProfileDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            },
            {
                pace: dto.pace,
                level: dto.level,
                difficulties: this.cleanList(dto.difficulties ?? []),
                preferredExplanationStyle: dto.preferredExplanationStyle?.trim(),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toProfileView(profile);
    }

    async explain(userId: string, studyAreaId: string, dto: AskAdaptiveExplanationDto) {
        await this.ensureStudyArea(userId, studyAreaId);

        const profile = await this.profileModel.findOne({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
        });

        const effectiveProfile =
            profile ??
            (await this.profileModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                pace: "BALANCED",
                level: "BEGINNER",
                difficulties: [],
            }));

        const materials = await this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                contentText: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .limit(8);

        if (materials.length === 0) {
            throw new UnprocessableEntityException(
                "Esta área ainda não tem materiais processáveis para gerar explicação.",
            );
        }

        const prompt = buildAdaptiveExplanationPrompt({
            topic: dto.topic.trim(),
            profile: effectiveProfile,
            materials,
        });

        let result: unknown;
        try {
            result = await this.aiProvider.generateAdaptiveExplanation({ prompt });
        } catch {
            throw new ServiceUnavailableException("A IA não está disponível neste momento.");
        }

        const { answer, sources, adaptationNotes } = this.normalizeAdaptiveResult(result, materials);

        const explanation = await this.explanationModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            topic: dto.topic.trim(),
            answer,
            sources,
            adaptationNotes,
        });

        return {
            id: explanation._id.toString(),
            topic: explanation.topic,
            answer: explanation.answer,
            sources: explanation.sources,
            adaptationNotes: explanation.adaptationNotes,
        };
    }

    private async ensureStudyArea(userId: string, studyAreaId: string) {
        const studyArea = await this.studyAreasService.getMyStudyArea(userId, studyAreaId);

        if (!studyArea) {
            throw new NotFoundException("Área de estudo não encontrada.");
        }

        return studyArea;
    }

    private cleanList(values: string[]) {
        return values.map((value) => value.trim()).filter(Boolean).slice(0, 8);
    }

    private normalizeAdaptiveResult(result: unknown, materials: MaterialDocument[]) {
        if (!result || typeof result !== "object") {
            throw new ServiceUnavailableException("A IA devolveu uma resposta inválida.");
        }

        const payload = result as Record<string, unknown>;
        const answer = typeof payload.answer === "string" ? payload.answer.trim() : "";
        if (!answer) {
            throw new ServiceUnavailableException("A IA devolveu uma resposta vazia.");
        }

        const allowedSources = new Map(
            materials.map((material) => [
                material._id.toString(),
                { materialId: material._id.toString(), title: material.title },
            ]),
        );
        const rawSourceIds = Array.isArray(payload.sourceMaterialIds)
            ? payload.sourceMaterialIds
            : [];
        const sources = rawSourceIds
            .filter((sourceId): sourceId is string => typeof sourceId === "string")
            .map((sourceId) => allowedSources.get(sourceId))
            .filter((source): source is { materialId: string; title: string } => Boolean(source));

        if (sources.length === 0) {
            throw new ServiceUnavailableException("A IA devolveu fontes inválidas.");
        }

        const adaptationNotes = Array.isArray(payload.adaptationNotes)
            ? payload.adaptationNotes.filter((note): note is string => typeof note === "string")
            : [];

        return { answer, sources, adaptationNotes };
    }

    private defaultProfile(studyAreaId: string) {
        return {
            id: "",
            studyAreaId,
            pace: "BALANCED",
            level: "BEGINNER",
            difficulties: [],
            preferredExplanationStyle: "",
        };
    }

    private toProfileView(profile: LearningProfile | LearningProfileDocument) {
        return {
            id: profile._id.toString(),
            studyAreaId: profile.studyAreaId.toString(),
            pace: profile.pace,
            level: profile.level,
            difficulties: profile.difficulties,
            preferredExplanationStyle: profile.preferredExplanationStyle ?? "",
        };
    }
}