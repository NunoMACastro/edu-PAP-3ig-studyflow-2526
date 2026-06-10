// apps/api/src/modules/guided-study-rooms/guided-study-rooms.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassesService } from "../classes/classes.service.js";
import { CreateGuidedStudyRoomDto } from "./dto/guided-study-room.dto.js";
import { GuidedStudyRoom, GuidedStudyRoomDocument } from "./schemas/guided-study-room.schema.js";

@Injectable()
export class GuidedStudyRoomsService {
    constructor(
        @InjectModel(GuidedStudyRoom.name)
        private readonly rooms: Model<GuidedStudyRoomDocument>,
        private readonly classesService: ClassesService,
    ) {}

    async create(actor: AuthenticatedUser, classId: string, dto: CreateGuidedStudyRoomDto) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const room = await this.rooms.create({
            classId: schoolClass._id,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            description: dto.description.trim(),
            materialIds: dto.materialIds ?? [],
            status: "OPEN",
        });
        return this.toView(room);
    }

    async listForTeacher(actor: AuthenticatedUser, classId: string) {
        this.assertTeacher(actor);
        const schoolClass = await this.classesService.findOwnedClass(actor.id, classId);
        const rooms = await this.rooms.find({ classId: schoolClass._id }).sort({ createdAt: -1 }).lean();
        return rooms.map((room) => this.toView(room));
    }

    async listForStudent(actor: AuthenticatedUser, classId: string) {
        this.assertStudent(actor);
        const schoolClass = await this.classesService.ensureStudentEnrollment(actor.id, classId);
        const rooms = await this.rooms.find({ classId: schoolClass._id, status: "OPEN" }).sort({ createdAt: -1 }).lean();
        return rooms.map((room) => this.toView(room));
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir salas guiadas.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem consultar salas guiadas da turma.");
        }
    }

    private toView(room: GuidedStudyRoom) {
        return {
            id: (room as any)._id.toString(),
            title: room.title,
            description: room.description,
            materialIds: room.materialIds,
            status: room.status,
        };
    }
}