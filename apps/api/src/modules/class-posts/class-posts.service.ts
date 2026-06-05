// apps/api/src/modules/class-posts/class-posts.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassesService } from "../classes/classes.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";
import { ClassPost, ClassPostDocument } from "./schemas/class-post.schema";

@Injectable()
export class ClassPostsService {
    constructor(
        @InjectModel(ClassPost.name)
        private readonly postModel: Model<ClassPostDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateClassPostDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);

        const post = await this.postModel.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            body: dto.body.trim(),
        });

        return this.toView(post);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    async listForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const posts = await this.postModel
            .find({ classId: schoolClass._id })
            .sort({ createdAt: -1 })
            .lean();

        return posts.map((post) => this.toView(post));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem criar publicações.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos inscritos podem ler publicações.");
        }
    }

    private toView(post: ClassPost | ClassPostDocument) {
        return {
            id: post._id.toString(),
            classId: post.classId.toString(),
            teacherId: post.teacherId.toString(),
            type: post.type,
            title: post.title,
            body: post.body,
        };
    }
}