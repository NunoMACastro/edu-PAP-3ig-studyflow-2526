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
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import {
    CreateStudyToolDto,
    STUDY_TOOL_TYPES,
    StudyToolType,
} from "./dto/create-study-tool.dto";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { buildStudyToolPrompt } from "./prompts/study-tools.prompt";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider";
import { AiArtifact, AiArtifactDocument } from "./schemas/ai-artifact.schema";
import { validateQuizArtifact } from "./validators/quiz.validator";

@Injectable()
export class StudyToolsService {
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
    ) {}

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

            if (input.type === "QUIZ") {
                validateQuizArtifact(contentJson);
            }

            return this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: input.type,
                contentJson,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });
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