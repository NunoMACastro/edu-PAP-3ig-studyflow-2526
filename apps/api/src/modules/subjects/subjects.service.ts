import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { isMongoDuplicateKeyError } from "../../common/utils/mongo-error.util.js";
import { ClassesService, SchoolClassView } from "../classes/classes.service.js";
import { CreateSubjectDto } from "./dto/create-subject.dto.js";
import { Subject, SubjectDocument } from "./schemas/subject.schema.js";

export type SubjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description?: string;
    createdAt?: Date;
};

/**
 * Serviço de disciplinas oficiais.
 */
@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name)
        private readonly subjectModel: Model<SubjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async createSubject(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateSubjectDto,
    ): Promise<SubjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const normalizedName = input.name.trim();
        const existing = await this.subjectModel
            .findOne({
                classId: new Types.ObjectId(schoolClass._id),
                name: normalizedName,
            })
            .lean();
        if (existing) throw this.duplicatedName();

        try {
            const subject = await this.subjectModel.create({
                classId: new Types.ObjectId(schoolClass._id),
                teacherId: new Types.ObjectId(actor.id),
                name: normalizedName,
                code: input.code.trim().toUpperCase(),
                description: input.description?.trim(),
            });
            return this.toSubjectView(subject.toObject());
        } catch (error) {
            if (isMongoDuplicateKeyError(error)) {
                throw this.duplicatedName();
            }
            throw error;
        }
    }

    async listTeacherClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<SubjectView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) => this.toSubjectView(subject));
    }

    async listStudentClassSubjects(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<SubjectView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const subjects = await this.subjectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ name: 1 })
            .lean();
        return subjects.map((subject) => this.toSubjectView(subject));
    }

    async findOwnedSubject(
        teacherId: string,
        subjectId: string,
    ): Promise<SubjectView> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel
            .findOne({
                _id: subjectId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!subject) throw this.subjectNotFound();
        return this.toSubjectView(subject);
    }

    /**
     * Obtém uma disciplina se o aluno estiver inscrito na turma respetiva.
     *
     * @param studentId Aluno autenticado.
     * @param subjectId Disciplina pedida.
     * @returns Disciplina e turma associada.
     */
    async findSubjectForStudent(
        studentId: string,
        subjectId: string,
    ): Promise<{ subject: SubjectView; schoolClass: SchoolClassView }> {
        if (!Types.ObjectId.isValid(subjectId)) throw this.subjectNotFound();
        const subject = await this.subjectModel.findById(subjectId).lean();
        if (!subject) throw this.subjectNotFound();
        const subjectView = this.toSubjectView(subject);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            studentId,
            subjectView.classId,
        );
        return { subject: subjectView, schoolClass };
    }

    private subjectNotFound(): NotFoundException {
        return new NotFoundException({
            code: "SUBJECT_NOT_FOUND",
            message: "Disciplina não encontrada.",
        });
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private duplicatedName(): ConflictException {
        return new ConflictException({
            code: "SUBJECT_NAME_DUPLICATED",
            message: "Já existe uma disciplina com esse nome nesta turma.",
        });
    }

    private toSubjectView(subject: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        name: string;
        code: string;
        description?: string;
        createdAt?: Date;
    }): SubjectView {
        return {
            _id: String(subject._id),
            classId: String(subject.classId),
            teacherId: String(subject.teacherId),
            name: subject.name,
            code: subject.code,
            description: subject.description,
            createdAt: subject.createdAt,
        };
    }
}
