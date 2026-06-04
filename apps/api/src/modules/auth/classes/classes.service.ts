import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../../common/types/authenticated-request";
import { User, UserDocument } from "../schemas/user.schema";
import { AddClassStudentDto } from "../dto/add-class-student.dto";
import { CreateClassDto } from "../dto/create-class.dto";
import { SchoolClass, SchoolClassDocument } from "./school-class.schema";

@Injectable()
export class ClassesService {
    constructor(
        @InjectModel(SchoolClass.name)
        private readonly classModel: Model<SchoolClassDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async create(actor: AuthenticatedUser, dto: CreateClassDto) {
        this.assertTeacher(actor);

        const code = dto.code.trim().toUpperCase();
        const duplicate = await this.classModel.exists({
            teacherId: new Types.ObjectId(actor.id),
            code,
        });

        if (duplicate) {
            throw new ConflictException("Já existe uma turma com este código.");
        }

        const schoolClass = await this.classModel.create({
            teacherId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            code,
            schoolYear: dto.schoolYear.trim(),
            description: dto.description?.trim(),
            studentIds: [],
        });

        return this.toView(schoolClass);
    }

    async listForTeacher(actor: AuthenticatedUser) {
        this.assertTeacher(actor);

        const classes = (await this.classModel
            .find({ teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean()) as Array<SchoolClass & { _id: Types.ObjectId }>;

        return classes.map((schoolClass) => this.toView(schoolClass));
    }

    async addStudent(actor: AuthenticatedUser, classId: string, dto: AddClassStudentDto) {
        this.assertTeacher(actor);

        const schoolClass = await this.findOwnedClass(actor.id, classId);
        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        if (!student) {
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const alreadyEnrolled = schoolClass.studentIds.some((id: Types.ObjectId) =>
            id.equals(studentId),
        );

        if (!alreadyEnrolled) {
            schoolClass.studentIds.push(studentId);
            await schoolClass.save();
        }

        return this.toView(schoolClass);
    }

    async listForStudent(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const classes = (await this.classModel
            .find({ studentIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean()) as Array<SchoolClass & { _id: Types.ObjectId }>;

        return classes.map((schoolClass) => this.toView(schoolClass));
    }

    async findOwnedClass(teacherId: string, classId: string) {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Turma não encontrada.");
        }

        const schoolClass = await this.classModel.findOne({
            _id: new Types.ObjectId(classId),
            teacherId: new Types.ObjectId(teacherId),
        });

        if (!schoolClass) {
            throw new NotFoundException("Turma não encontrada para este professor.");
        }

        return schoolClass;
    }

    async ensureStudentEnrollment(studentId: string, classId: string) {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException("Turma não encontrada.");
        }

        const schoolClass = await this.classModel.findOne({
            _id: new Types.ObjectId(classId),
            studentIds: new Types.ObjectId(studentId),
        });

        if (!schoolClass) {
            throw new ForbiddenException("Aluno sem inscrição nesta turma.");
        }

        return schoolClass;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir turmas.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar as suas turmas.");
        }
    }

    private toView(schoolClass: SchoolClassDocument | (SchoolClass & { _id: Types.ObjectId })) {
        return {
            id: schoolClass._id.toString(),
            teacherId: schoolClass.teacherId.toString(),
            name: schoolClass.name,
            code: schoolClass.code,
            schoolYear: schoolClass.schoolYear,
            description: schoolClass.description ?? "",
            studentIds: schoolClass.studentIds.map((id: Types.ObjectId) => id.toString()),
        };
    }
}