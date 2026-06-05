// apps/api/src/modules/teacher-ai/teacher-ai-voice.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoice, TeacherAiVoiceDocument } from "./schemas/teacher-ai-voice.schema";

@Injectable()
export class TeacherAiVoiceService {
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async upsert(actor: AuthenticatedUser, subjectId: string, dto: UpdateTeacherAiVoiceDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const voice = await this.voiceModel.findOneAndUpdate(
            { subjectId: subject._id },
            {
                teacherId: new Types.ObjectId(actor.id),
                subjectId: subject._id,
                tone: dto.tone,
                detailLevel: dto.detailLevel,
                rules: this.cleanRules(dto.rules ?? []),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return this.toView(voice);
    }

    async getForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const voice = await this.voiceModel.findOne({ subjectId: subject._id });
        return voice ? this.toView(voice) : this.defaultVoice(subject);
    }

    async findForSubject(subject: Subject) {
        return this.voiceModel.findOne({ subjectId: subject._id }).lean();
    }

    private cleanRules(rules: string[]) {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, 8);
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem configurar a voz da IA.");
        }
    }

    private defaultVoice(subject: Subject) {
        return {
            id: "",
            subjectId: subject._id.toString(),
            teacherId: subject.teacherId.toString(),
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    private toView(voice: TeacherAiVoice | TeacherAiVoiceDocument) {
        return {
            id: voice._id.toString(),
            subjectId: voice.subjectId.toString(),
            teacherId: voice.teacherId.toString(),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules,
        };
    }
}