// apps/api/src/modules/class-projects/class-projects.service.ts
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateClassProjectDto } from "./dto/class-project.dto";
import { ClassProject, ClassProjectDocument } from "./schemas/class-project.schema";

@Injectable()
export class ClassProjectsService {
    constructor(
        @InjectModel(ClassProject.name)
        private readonly projects: Model<ClassProjectDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateClassProjectDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const project = await this.projects.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            brief: dto.brief.trim(),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            status: "DRAFT",
        });
        return this.toView(project);
    }

    async publish(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const project = await this.projects.findOneAndUpdate(
            { _id: projectId, classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) },
            { status: "PUBLISHED" },
            { new: true },
        );
        if (!project) {
            throw new NotFoundException("Projeto não encontrado para esta turma.");
        }
        return this.toView(project);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const projects = await this.projects.find({ classId: schoolClass._id }).sort({ createdAt: -1 }).lean();
        return projects.map((project) => this.toView(project));
    }

    async listPublishedForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const projects = await this.projects.find({ classId: schoolClass._id, status: "PUBLISHED" }).sort({ createdAt: -1 }).lean();
        return projects.map((project) => this.toView(project));
    }

    async findPublishedForStudent(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const project = await this.projects.findOne({ _id: projectId, classId: schoolClass._id, status: "PUBLISHED" });
        if (!project) {
            throw new NotFoundException("Projeto publicado não encontrado para este aluno.");
        }
        return project;
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir projetos.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar projetos publicados.");
        }
    }

    private toView(project: ClassProject) {
        return {
            id: project._id.toString(),
            title: project.title,
            brief: project.brief,
            dueDate: project.dueDate?.toISOString() ?? null,
            status: project.status,
        };
    }
}