// apps/api/src/modules/subjects/subjects.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateSubjectDto } from "../materials/dto/create-subject.dto.js";
import { Subject, SubjectDocument } from "../materials/schemas/subject.schema.js";

type SubjectWithId = Subject & { _id: Types.ObjectId };

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateSubjectDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const duplicate = await this.subjectModel.exists({
            classId: schoolClass._id,
            name: dto.name.trim(),
        });

        if (duplicate) {
            throw new ConflictException("Já existe uma disciplina com este nome nesta turma.");
        }

        const subject = await this.subjectModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            code: dto.code?.trim().toUpperCase(),
            description: dto.description?.trim(),
        });

        return this.toView(subject);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const subjects = await this.subjectModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ name: 1 })
            .lean<SubjectWithId[]>();

        return subjects.map((subject) => this.toView(subject));
    }

    async findOwnedSubject(teacherId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findOne({
            _id: new Types.ObjectId(subjectId),
            teacherId: new Types.ObjectId(teacherId),
        });

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada para este professor.");
        }

        return subject;
    }

    async findSubjectForStudent(studentId: string, subjectId: string) {
        if (!Types.ObjectId.isValid(subjectId)) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        const subject = await this.subjectModel.findById(subjectId);

        if (!subject) {
            throw new NotFoundException("Disciplina não encontrada.");
        }

        await this.classesService.ensureStudentEnrollment(studentId, subject.classId.toString());
        return subject;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir disciplinas.");
        }
    }

    private toView(subject: SubjectWithId | SubjectDocument) {
        return {
            id: subject._id.toString(),
            classId: subject.classId.toString(),
            teacherId: subject.teacherId.toString(),
            name: subject.name,
            code: subject.code ?? "",
            description: subject.description ?? "",
        };
    }
}