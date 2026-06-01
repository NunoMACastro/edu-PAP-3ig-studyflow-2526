import {
    BadGatewayException,
    BadRequestException,
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
import {
    CreateStudyToolDto,
    STUDY_TOOL_TYPES,
    StudyToolType,
} from "./dto/create-study-tool.dto.js";
import { buildStudyToolPrompt } from "./prompts/study-tools.prompt.js";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider.js";
import {
    AiArtifact,
    AiArtifactDocument,
} from "./schemas/ai-artifact.schema.js";
import { validateStudyToolArtifact } from "./validators/ai-artifact.validator.js";

/**
 * Serviço de explicações, flashcards e quizzes personalizados.
 */
@Injectable()
export class StudyToolsService {
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
     * Lista ferramentas de estudo já geradas.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param type Tipo opcional para filtrar.
     * @returns Artefactos IA da área.
     */
    async listTools(userId: string, studyAreaId: string, type?: StudyToolType) {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const query: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: { $in: ["EXPLANATION", "FLASHCARDS", "QUIZ"] },
        };
        if (type) query.type = type;
        return this.artifactModel.find(query).sort({ createdAt: -1 }).lean();
    }

    /**
     * Gera uma ferramenta de estudo baseada nas fontes da área.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param input Pedido de ferramenta.
     * @returns Artefacto criado.
     */
    async generateStudyTool(
        userId: string,
        studyAreaId: string,
        input: CreateStudyToolDto,
    ) {
        if (!STUDY_TOOL_TYPES.includes(input.type)) {
            throw new BadRequestException({
                code: "INVALID_STUDY_TOOL_TYPE",
                message: "Tipo de ferramenta inválido.",
            });
        }

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
                    "Este material ainda não tem texto processável para gerar conteúdo de estudo.",
            });
        }

        try {
            const contentJson = await this.aiProvider.generateStudyTool({
                type: input.type,
                prompt: buildStudyToolPrompt({
                    areaName: area.name,
                    type: input.type,
                    topic: input.topic,
                    voiceTone: profile.voiceTone,
                    sources,
                }),
            });

            const sourceMaterialIds = sources.map(({ materialId }) => materialId);
            validateStudyToolArtifact(input.type, contentJson, sourceMaterialIds);

            const artifact = await this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: input.type,
                contentJson,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });

            await this.historyService.recordEvent(
                userId,
                "STUDY_TOOL_GENERATED",
                "Ferramenta de estudo gerada",
                input.type,
            );

            return artifact;
        } catch (error) {
            if (
                error instanceof BadGatewayException ||
                error instanceof BadRequestException ||
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

    /**
     * Obtém fontes textuais prontas.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Fontes no contrato do provider.
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
