import {
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HistoryService } from "../study/history.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import { buildSummaryPrompt } from "./prompts/summary.prompt.js";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider.js";
import {
    AiArtifact,
    AiArtifactDocument,
} from "./schemas/ai-artifact.schema.js";
import { validateSummaryArtifact } from "./validators/ai-artifact.validator.js";

/**
 * Serviço de geração de resumos baseados nos materiais enviados.
 */
@Injectable()
export class SummariesService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Gera um resumo factual de uma área.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Artefacto persistido com conteúdo e fontes.
     */
    async generateSummary(userId: string, studyAreaId: string) {
        const area = await this.areasService.getMyStudyArea(userId, studyAreaId);
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
                prompt: buildSummaryPrompt(area.name, sources, profile.voiceTone),
            });
            const sourceMaterialIds = sources.map(({ materialId }) => materialId);
            validateSummaryArtifact(result, sourceMaterialIds);

            const artifact = await this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "SUMMARY",
                contentJson: result,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });

            await this.historyService.recordEvent(
                userId,
                "SUMMARY_GENERATED",
                "Resumo gerado",
                area.name,
            );

            return artifact;
        } catch (error) {
            if (error instanceof UnprocessableEntityException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Obtém fontes prontas para IA.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Fontes textuais processáveis.
     */
    private async getProcessableSources(
        userId: string,
        studyAreaId: string,
    ): Promise<AiSource[]> {
        const materials = await this.materialsService.listReadyTextSources(
            userId,
            studyAreaId,
        );
        return materials.map((material) => ({
            materialId: String(material._id),
            title: material.title,
            contentText: material.contentText!,
        }));
    }
}
