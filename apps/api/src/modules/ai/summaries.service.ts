import {
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { buildSummaryPrompt } from "./prompts/summary.prompt";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider";
import { AiArtifact, AiArtifactDocument } from "./schemas/ai-artifact.schema";

@Injectable()
export class SummariesService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
    ) {}

    async generateSummary(userId: string, studyAreaId: string) {
        const area = await this.areasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        const profile = await this.profileService.prepareProfile(
            userId,
            studyAreaId,
        );
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar resumo.",
            });
        }

        try {
            const result = await this.aiProvider.generateSummary({
                prompt: buildSummaryPrompt(
                    area.name,
                    sources,
                    profile.voiceTone,
                ),
            });

            return this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "SUMMARY",
                contentJson: result,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });
        } catch (error) {
            if (error instanceof UnprocessableEntityException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    private async getProcessableSources(
        userId: string,
        studyAreaId: string,
    ): Promise<AiSource[]> {
        const materials = await this.materialsService.listByArea(
            userId,
            studyAreaId,
        );
        return materials
            .filter(
                (material) =>
                    material.status === "READY" && material.contentText,
            )
            .map((material) => ({
                materialId: material._id.toString(),
                title: material.title,
                contentText: material.contentText,
            }));
    }
}