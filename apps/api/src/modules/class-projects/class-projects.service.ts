import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateClassProjectDto } from "./dto/create-class-project.dto.js";
import {
    ClassProject,
    ClassProjectDocument,
    ClassProjectStatus,
} from "./schemas/class-project.schema.js";

export type ClassProjectView = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    brief: string;
    subject?: string;
    dueDate?: Date;
    status: ClassProjectStatus;
    createdAt?: Date;
};

/**
 * Serviço de projectos oficiais da turma.
 */
@Injectable()
export class ClassProjectsService {
    constructor(
        @InjectModel(ClassProject.name)
        private readonly projectModel: Model<ClassProjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateClassProjectDto,
    ): Promise<ClassProjectView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const project = await this.projectModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            brief: input.brief.trim(),
            subject: input.subject?.trim(),
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            status: input.status ?? "DRAFT",
        });
        return this.toView(project.toObject());
    }

    async listForTeacher(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassProjectView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const projects = await this.projectModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ createdAt: -1 })
            .lean();
        return projects.map((project) => this.toView(project));
    }

    async listPublishedForStudent(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassProjectView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const projects = await this.projectModel
            .find({
                classId: new Types.ObjectId(schoolClass._id),
                status: "PUBLISHED",
            })
            .sort({ createdAt: -1 })
            .lean();
        return projects.map((project) => this.toView(project));
    }

    async findPublishedForStudent(
        studentId: string,
        projectId: string,
    ): Promise<ClassProjectView> {
        if (!Types.ObjectId.isValid(projectId)) throw this.notFound();
        const project = await this.projectModel
            .findOne({ _id: projectId, status: "PUBLISHED" })
            .lean();
        if (!project) throw this.notFound();
        const view = this.toView(project);
        await this.classesService.ensureStudentEnrollment(studentId, view.classId);
        return view;
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

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "CLASS_PROJECT_NOT_FOUND",
            message: "Projecto não encontrado.",
        });
    }

    private toView(project: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        brief: string;
        subject?: string;
        dueDate?: Date;
        status: ClassProjectStatus;
        createdAt?: Date;
    }): ClassProjectView {
        return {
            _id: String(project._id),
            classId: String(project.classId),
            teacherId: String(project.teacherId),
            title: project.title,
            brief: project.brief,
            subject: project.subject,
            dueDate: project.dueDate,
            status: project.status,
            createdAt: project.createdAt,
        };
    }
}
