// apps/api/src/modules/official-tests/official-tests.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateOfficialTestDto } from "./dto/official-test.dto";
import { OfficialTest, OfficialTestDocument } from "./schemas/official-test.schema";

@Injectable()
export class OfficialTestsService {
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly tests: Model<OfficialTestDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialTestDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const test = await this.tests.create({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id), title: dto.title.trim(), type: dto.type, questions: dto.questions });
        return this.toView(test);
    }

    async listForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);
        const tests = await this.tests.find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return tests.map((test) => this.toView(test));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem criar testes oficiais.");
        }
    }

    private toView(test: OfficialTest) {
        return { id: test._id.toString(), title: test.title, type: test.type, questionCount: test.questions.length };
    }
}