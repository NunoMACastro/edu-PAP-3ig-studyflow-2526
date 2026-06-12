import {
    BadRequestException,
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

type StudyRoomView = {
    _id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: Date;
};

/**
 * Serviço de salas de estudo.
 */
@Injectable()
export class StudyRoomsService {
    constructor(
        @InjectModel(StudyRoom.name)
        private readonly roomModel: Model<StudyRoomDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async createRoom(
        actor: AuthenticatedUser,
        input: CreateStudyRoomDto,
    ): Promise<StudyRoomView> {
        this.assertStudent(actor);
        const name = input.name.trim();
        const disciplineName = input.disciplineName?.trim();

        if (input.type === "SUBJECT" && !disciplineName) {
            throw new BadRequestException({
                code: "DISCIPLINE_NAME_REQUIRED",
                message: "Indica a disciplina da sala.",
            });
        }

        const room = await this.roomModel.create({
            ownerStudentId: new Types.ObjectId(actor.id),
            name,
            type: input.type,
            disciplineName: input.type === "SUBJECT" ? disciplineName : undefined,
            description: input.description?.trim(),
            memberIds: [new Types.ObjectId(actor.id)],
        });

        return this.toRoomView(room.toObject());
    }

    async listMyRooms(actor: AuthenticatedUser): Promise<StudyRoomView[]> {
        this.assertStudent(actor);
        const rooms = await this.roomModel
            .find({ memberIds: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        return rooms.map((room) => this.toRoomView(room));
    }

    async addMember(
        actor: AuthenticatedUser,
        roomId: string,
        input: AddRoomMemberDto,
    ): Promise<StudyRoomView> {
        this.assertStudent(actor);
        await this.ensureMember(actor.id, roomId);

        const member = await this.userModel
            .findOne({ email: input.email.trim().toLowerCase(), role: "STUDENT" })
            .lean();
        if (!member) {
            throw new NotFoundException({
                code: "ROOM_MEMBER_NOT_FOUND",
                message: "Aluno não encontrado.",
            });
        }

        const updated = await this.roomModel
            .findByIdAndUpdate(
                roomId,
                { $addToSet: { memberIds: member._id } },
                { new: true, runValidators: true },
            )
            .lean();
        if (!updated) throw this.roomNotFound();
        return this.toRoomView(updated);
    }

    /**
     * Confirma que um aluno pertence à sala.
     *
     * @param studentId Identificador vindo da sessão.
     * @param roomId Identificador da sala.
     * @returns Sala encontrada.
     */
    async ensureMember(studentId: string, roomId: string): Promise<StudyRoomView> {
        if (!Types.ObjectId.isValid(roomId)) {
            throw this.roomNotFound();
        }

        const room = await this.roomModel
            .findOne({
                _id: roomId,
                memberIds: new Types.ObjectId(studentId),
            })
            .lean();

        if (!room) {
            throw new ForbiddenException({
                code: "ROOM_ACCESS_DENIED",
                message: "Não tens acesso a esta sala.",
            });
        }

        return this.toRoomView(room);
    }

    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    private roomNotFound(): NotFoundException {
        return new NotFoundException({
            code: "STUDY_ROOM_NOT_FOUND",
            message: "Sala de estudo não encontrada.",
        });
    }

    private toRoomView(room: {
        _id: unknown;
        ownerStudentId: unknown;
        name: string;
        type: "FREE" | "SUBJECT";
        disciplineName?: string;
        description?: string;
        memberIds: unknown[];
        createdAt?: Date;
    }): StudyRoomView {
        return {
            _id: String(room._id),
            ownerStudentId: String(room.ownerStudentId),
            name: room.name,
            type: room.type,
            disciplineName: room.disciplineName,
            description: room.description,
            memberIds: room.memberIds.map((memberId) => String(memberId)),
            createdAt: room.createdAt,
        };
    }
}
