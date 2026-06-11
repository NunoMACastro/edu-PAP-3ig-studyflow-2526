// apps/api/src/modules/class-ai/class-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { OfficialMaterialsService } from "../official-materials/official-materials.service";
import { SubjectsService } from "../subjects/subjects.service";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service";
import { CreateClassAiAnswerDto } from "./dto/class-ai-answer.dto";
import { ClassAiAnswer, ClassAiAnswerDocument } from "./schemas/class-ai-answer.schema";

@Injectable()
export class ClassAiService {
    constructor(
        @InjectModel(ClassAiAnswer.name)
        private readonly answers: Model<ClassAiAnswerDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly teacherAiVoiceService: TeacherAiVoiceService,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    ) {}

    async ask(actor: AuthenticatedUser, subjectId: string, dto: CreateClassAiAnswerDto) {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const materials = await this.officialMaterialsService.findProcessedBySubject(subject);
        if (materials.length === 0) {
            throw new UnprocessableEntityException("Disciplina sem materiais oficiais processados.");
        }
        const voice = await this.teacherAiVoiceService.findForSubject(subject);
        const rules = voice?.rules ?? [];
        const answerText = await this.generateAnswer(dto.question, materials.map((material) => material.contentText).join("\n"), rules);
        const answer = await this.answers.create({ subjectId: subject._id, classId: subject.classId, studentId: new Types.ObjectId(actor.id), question: dto.question.trim(), answer: answerText, officialMaterialIds: materials.map((material) => material._id.toString()), teacherVoiceRules: rules });
        return this.toView(answer);
    }

    async list(actor: AuthenticatedUser, subjectId: string) {
        this.assertStudent(actor);
        const subject = await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const answers = await this.answers.find({ subjectId: subject._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return answers.map((answer) => this.toView(answer));
    }

    private async generateAnswer(question: string, sourceText: string, rules: string[]) {
        try {
            return await this.aiProvider.generateText({
                system: "Responde como assistente da disciplina, respeitando a voz docente e citando fontes oficiais.",
                user: [question, "Regras docentes:", rules.join("\n"), "Fontes:", sourceText].join("\n"),
                sources: [{ id: "official-subject", title: "Materiais oficiais" }],
            });
        } catch (error) {
            throw new ServiceUnavailableException("IA da disciplina indisponível neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem usar a IA da disciplina.");
        }
    }
    private toView(answer: ClassAiAnswer) {
        return { id: answer._id.toString(), question: answer.question, answer: answer.answer, officialMaterialIds: answer.officialMaterialIds, teacherVoiceRules: answer.teacherVoiceRules };
    }
}