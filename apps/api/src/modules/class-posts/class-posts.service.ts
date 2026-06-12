import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateClassPostDto } from "./dto/create-class-post.dto.js";
import { ClassPost, ClassPostDocument, ClassPostType } from "./schemas/class-post.schema.js";

export type ClassPostView = {
    _id: string;
    classId: string;
    teacherId: string;
    type: ClassPostType;
    title: string;
    body: string;
    createdAt?: Date;
};

/**
 * Serviço de avisos e publicações oficiais.
 */
@Injectable()
export class ClassPostsService {
    constructor(
        @InjectModel(ClassPost.name)
        private readonly postModel: Model<ClassPostDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async createPost(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateClassPostDto,
    ): Promise<ClassPostView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const post = await this.postModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
            body: input.body.trim(),
        });
        return this.toPostView(post.toObject());
    }

    async listTeacherPosts(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassPostView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        return this.listByClass(schoolClass._id);
    }

    async listStudentPosts(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<ClassPostView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        return this.listByClass(schoolClass._id);
    }

    /**
     * Conta publicações de uma turma já validada.
     *
     * @param classId Identificador da turma.
     * @returns Número de publicações.
     */
    async countByClassId(classId: string): Promise<number> {
        return this.postModel.countDocuments({
            classId: new Types.ObjectId(classId),
        });
    }

    private async listByClass(classId: string): Promise<ClassPostView[]> {
        const posts = await this.postModel
            .find({ classId: new Types.ObjectId(classId) })
            .sort({ createdAt: -1 })
            .lean();
        return posts.map((post) => this.toPostView(post));
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

    private toPostView(post: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        type: ClassPostType;
        title: string;
        body: string;
        createdAt?: Date;
    }): ClassPostView {
        return {
            _id: String(post._id),
            classId: String(post.classId),
            teacherId: String(post.teacherId),
            type: post.type,
            title: post.title,
            body: post.body,
            createdAt: post.createdAt,
        };
    }
}
