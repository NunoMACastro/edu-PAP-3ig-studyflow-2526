import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { User, UserDocument } from "../auth/schemas/user.schema.js";
import { AddRoomMemberDto } from "./dto/add-room-member.dto.js";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto.js";
import { StudyRoom, StudyRoomDocument } from "./schemas/study-room.schema.js";

@Injectable()
export class StudyRoomsService {
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async create(actor: AuthenticatedUser, dto: CreateStudyRoomDto) {
        this.assertStudent(actor);

        const disciplineName = this.resolveDisciplineName(dto);
        const room = await this.roomModel.create({
            ownerStudentId: new Types.ObjectId(actor.id),
            name: dto.name.trim(),
            type: dto.type,
            disciplineName,
            description: dto.description?.trim(),
            memberIds: [new Types.ObjectId(actor.id)],
        });

        return this.toView(room);
    }

    async listMine(actor: AuthenticatedUser) {
        this.assertStudent(actor);

        const rooms = await this.roomModel
            .find({ memberIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return rooms.map((room) => this.toView(room));
    }

    async addMember(actor: AuthenticatedUser, roomId: string, dto: AddRoomMemberDto) {
        this.assertStudent(actor);
        const room = await this.ensureMember(actor.id, roomId);

        const student = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim(), role: "STUDENT" })
            .lean();

        if (!student) {
            throw new NotFoundException("Aluno não encontrado.");
        }

        const studentId = new Types.ObjectId(student._id);
        const exists = room.memberIds.some((id) => id.equals(studentId));

        if (!exists) {
            room.memberIds.push(studentId);
            await room.save();
        }

        return this.toView(room);
    }

    async ensureMember(studentId: string, roomId: string) {
        if (!Types.ObjectId.isValid(roomId)) {
            throw new NotFoundException("Sala não encontrada.");
        }

        const room = await this.roomModel.findOne({
            _id: new Types.ObjectId(roomId),
            memberIds: new Types.ObjectId(studentId),
        });

        if (!room) {
            throw new ForbiddenException("Só membros podem aceder a esta sala.");
        }

        return room;
    }

    private resolveDisciplineName(dto: CreateStudyRoomDto) {
        // Sala livre não fica presa a qualquer disciplina textual ou oficial.
        if (dto.type === "FREE") {
            return undefined;
        }

        const disciplineName = dto.disciplineName?.trim();
        if (!disciplineName) {
            throw new BadRequestException("Indica o nome da disciplina.");
        }

        return disciplineName;
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem gerir salas de estudo.");
        }
    }

    private toView(room: any) {
        return {
            id: String(room._id),
            ownerStudentId: String(room.ownerStudentId),
            name: room.name,
            type: room.type,
            disciplineName: room.disciplineName ?? "",
            description: room.description ?? "",
            memberIds: (room.memberIds ?? []).map((id: any) => String(id)),
        };
    }
}

/**
 * Serviço para áreas de estudo pessoais.
 *
 * Implementado aqui para manter compatibilidade com imports existentes.
 */
export class StudyAreasService {
    constructor(private readonly areaModel: any, private readonly historyService: any) {}

    async createStudyArea(userId: string, dto: { name?: string; description?: string }) {
        const name = String(dto.name ?? "").trim();
        if (!name) {
            throw new BadRequestException("Indica o nome da área.");
        }

        try {
            const created = await this.areaModel.create({ userId, name, description: dto.description?.trim(), archived: false });
            if (this.historyService?.recordEvent) {
                try {
                    this.historyService.recordEvent(userId, "STUDY_AREA_CREATED", created);
                } catch (e) {
                    // ignore history errors
                }
            }
            return created;
        } catch (err: any) {
            if (err && err.code === 11000) {
                const ex = new ConflictException();
                (ex as any).response = { code: "AREA_NAME_DUPLICATED" };
                throw ex;
            }
            throw err;
        }
    }

    async updateStudyArea(userId: string, id: string, dto: { name?: string; description?: string }) {
        if (dto.name !== undefined && String(dto.name).trim() === "") {
            throw new BadRequestException("Indica o nome da área.");
        }

        try {
            const updated = await this.areaModel.findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true }).lean();
            return updated;
        } catch (err: any) {
            if (err && err.code === 11000) {
                throw new ConflictException();
            }
            throw err;
        }
    }

    async listMyStudyAreas(userId: string) {
        const areas = await this.areaModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return areas.map(({ userId: _u, ...rest }: any) => rest);
    }

    async getMyStudyArea(userId: string, id: string) {
        return this.areaModel.findOne({ _id: id, userId }).lean();
    }

    async countMyStudyAreas(userId: string) {
        return this.areaModel.countDocuments({ userId });
    }
}