import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto.js";
import {
    TeacherAiDetailLevel,
    TeacherAiTone,
    TeacherAiVoice,
    TeacherAiVoiceDocument,
} from "./schemas/teacher-ai-voice.schema.js";

export type TeacherAiVoiceView = {
    _id?: string;
    subjectId: string;
    classId?: string;
    teacherId?: string;
    tone: TeacherAiTone;
    detailLevel: TeacherAiDetailLevel;
    rules: string[];
};

/**
 * Serviço da voz docente textual.
 */
@Injectable()
export class TeacherAiVoiceService {
    constructor(
        @InjectModel(TeacherAiVoice.name)
        private readonly voiceModel: Model<TeacherAiVoiceDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async getTeacherVoice(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const voice = await this.voiceModel
            .findOne({ subjectId: new Types.ObjectId(subject._id) })
            .lean();
        if (!voice) return this.defaultVoice(subject._id);
        return this.toVoiceView(voice);
    }

    async updateTeacherVoice(
        actor: AuthenticatedUser,
        subjectId: string,
        input: UpdateTeacherAiVoiceDto,
    ): Promise<TeacherAiVoiceView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const voice = await this.voiceModel
            .findOneAndUpdate(
                { subjectId: new Types.ObjectId(subject._id) },
                {
                    $set: {
                        tone: input.tone,
                        detailLevel: input.detailLevel,
                        rules: this.cleanRules(input.rules ?? []),
                    },
                    $setOnInsert: {
                        subjectId: new Types.ObjectId(subject._id),
                        classId: new Types.ObjectId(subject.classId),
                        teacherId: new Types.ObjectId(actor.id),
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();
        return this.toVoiceView(voice);
    }

    async findVoiceForSubject(subjectId: string): Promise<TeacherAiVoiceView> {
        const voice = await this.voiceModel
            .findOne({ subjectId: new Types.ObjectId(subjectId) })
            .lean();
        if (!voice) return this.defaultVoice(subjectId);
        return this.toVoiceView(voice);
    }

    private defaultVoice(subjectId: string): TeacherAiVoiceView {
        return {
            subjectId,
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        };
    }

    private cleanRules(rules: string[]): string[] {
        return rules
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0)
            .slice(0, 8);
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private toVoiceView(voice: {
        _id?: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        tone: TeacherAiTone;
        detailLevel: TeacherAiDetailLevel;
        rules?: string[];
    }): TeacherAiVoiceView {
        return {
            _id: voice._id ? String(voice._id) : undefined,
            subjectId: String(voice.subjectId),
            classId: String(voice.classId),
            teacherId: String(voice.teacherId),
            tone: voice.tone,
            detailLevel: voice.detailLevel,
            rules: voice.rules ?? [],
        };
    }
}
