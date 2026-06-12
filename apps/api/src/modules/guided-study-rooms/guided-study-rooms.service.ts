import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
    GuidedStudyRoomStatus,
} from "./schemas/guided-study-room.schema.js";

export type GuidedStudyRoomView = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    description: string;
    materialIds: string[];
    status: GuidedStudyRoomStatus;
    createdAt?: Date;
};

/**
 * Serviço de salas guiadas com autorização por turma.
 */
@Injectable()
export class GuidedStudyRoomsService {
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly roomModel: Model<GuidedStudyRoomDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(
        actor: AuthenticatedUser,
        classId: string,
        input: CreateGuidedStudyRoomDto,
    ): Promise<GuidedStudyRoomView> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const room = await this.roomModel.create({
            classId: new Types.ObjectId(schoolClass._id),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description.trim(),
            materialIds: input.materialIds ?? [],
            status: "OPEN",
        });
        return this.toView(room.toObject());
    }

    async listForTeacher(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<GuidedStudyRoomView[]> {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(
            actor.id,
            classId,
        );
        const rooms = await this.roomModel
            .find({ classId: new Types.ObjectId(schoolClass._id) })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toView(room));
    }

    async listForStudent(
        actor: AuthenticatedUser,
        classId: string,
    ): Promise<GuidedStudyRoomView[]> {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(
            actor.id,
            classId,
        );
        const rooms = await this.roomModel
            .find({
                classId: new Types.ObjectId(schoolClass._id),
                status: "OPEN",
            })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toView(room));
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

    private toView(room: {
        _id: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        description: string;
        materialIds?: string[];
        status: GuidedStudyRoomStatus;
        createdAt?: Date;
    }): GuidedStudyRoomView {
        return {
            _id: String(room._id),
            classId: String(room.classId),
            teacherId: String(room.teacherId),
            title: room.title,
            description: room.description,
            materialIds: room.materialIds ?? [],
            status: room.status,
            createdAt: room.createdAt,
        };
    }
}
