// apps/api/src/modules/private-area-ai/private-area-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { MaterialsService } from "../materials/materials.service";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { CreatePrivateAreaAiAnswerDto } from "./dto/private-area-ai-answer.dto";
import { PrivateAreaAiAnswer, PrivateAreaAiAnswerDocument } from "./schemas/private-area-ai-answer.schema";

@Injectable()
export class PrivateAreaAiService {
    constructor(
        @InjectModel(PrivateAreaAiAnswer.name)
        private readonly answers: Model<PrivateAreaAiAnswerDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly materialsService: MaterialsService,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    ) {}

    async ask(actor: AuthenticatedUser, studyAreaId: string, dto: CreatePrivateAreaAiAnswerDto) {
        this.assertStudent(actor);
        const area = await this.studyAreasService.getMyStudyArea(actor.id, studyAreaId);
        const materials = await this.materialsService.listByArea(actor.id, area._id.toString());
        const sources = materials.filter((material) => Boolean(material.contentText));
        if (sources.length === 0) {
            throw new UnprocessableEntityException("A área ainda não tem fontes suficientes para IA.");
        }
        const answerText = await this.generateAnswer(dto.question, sources.map((source) => source.contentText).join("\n"));
        const answer = await this.answers.create({ studyAreaId: area._id, studentId: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: answerText, sourceMaterialIds: sources.map((source) => source._id.toString()) });
        return this.toView(answer);
    }

    async list(actor: AuthenticatedUser, studyAreaId: string) {
        this.assertStudent(actor);
        const area = await this.studyAreasService.getMyStudyArea(actor.id, studyAreaId);
        const answers = await this.answers.find({ studyAreaId: area._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return answers.map((answer) => this.toView(answer));
    }

    private async generateAnswer(question: string, sourceText: string) {
        try {
            return await this.aiProvider.generateText({
                system: "Responde só com base nos materiais privados do aluno.",
                user: [question, "Fontes:", sourceText].join("\n"),
                sources: [{ id: "private-area", title: "Materiais privados" }],
            });
        } catch (error) {
            throw new ServiceUnavailableException("IA privada indisponível neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem usar a IA privada.");
        }
    }
    private toView(answer: PrivateAreaAiAnswer) {
        return { id: answer._id.toString(), question: answer.question, answer: answer.answer, sourceMaterialIds: answer.sourceMaterialIds };
    }
}