import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import {
    OfficialTest,
    OfficialTestDocument,
    OfficialTestQuestion,
    OfficialTestStatus,
} from "./schemas/official-test.schema.js";

export type OfficialTestView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    description?: string;
    status: OfficialTestStatus;
    questions: OfficialTestQuestion[];
    createdAt?: Date;
};

/**
 * Serviço de testes oficiais por disciplina.
 */
@Injectable()
export class OfficialTestsService {
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialTestDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const questions = input.questions.map((question) =>
            this.normalizeQuestion(question),
        );
        const test = await this.testModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description?.trim(),
            status: input.status ?? "DRAFT",
            questions,
        });
        return this.toView(test.toObject());
    }

    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return tests.map((test) => this.toView(test));
    }

    async countPublishedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.testModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "PUBLISHED",
        });
    }

    private normalizeQuestion(question: OfficialTestQuestion): OfficialTestQuestion {
        const options = question.options.map((option) => option.trim());
        if (new Set(options).size !== options.length || options.some((option) => !option)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_OPTIONS",
                message: "Cada pergunta deve ter quatro opções distintas e preenchidas.",
            });
        }
        return {
            statement: question.statement.trim(),
            topic: question.topic?.trim(),
            options,
            correctOptionIndex: question.correctOptionIndex,
        };
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private toView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        description?: string;
        status: OfficialTestStatus;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            teacherId: String(test.teacherId),
            title: test.title,
            description: test.description,
            status: test.status,
            questions: test.questions,
            createdAt: test.createdAt,
        };
    }
}
