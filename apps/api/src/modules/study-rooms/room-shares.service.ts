// apps/api/src/modules/study-rooms/room-shares.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Material, MaterialDocument } from "../materials/schemas/material.schema";
import { CreateRoomShareDto } from "./dto/create-room-share.dto";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema";
import { StudyRoomsService } from "./study-rooms.service";

@Injectable()
export class RoomSharesService {
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    async create(actor: AuthenticatedUser, roomId: string, dto: CreateRoomShareDto) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);
        const material = await this.resolveOwnedMaterial(actor.id, dto);
        const textContent = this.resolveTextContent(dto, material);
        const usableByAi = Boolean(textContent && textContent.length >= 10);

        const share = await this.shareModel.create({
            roomId: room._id,
            authorStudentId: new Types.ObjectId(actor.id),
            type: dto.type,
            title: dto.title.trim(),
            textContent,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            materialId: material?._id,
            usableByAi,
        });

        return this.toView(share);
    }

    async list(actor: AuthenticatedUser, roomId: string) {
        this.assertStudent(actor);
        const room = await this.studyRoomsService.ensureMember(actor.id, roomId);

        const shares = await this.shareModel
            .find({ roomId: room._id })
            .sort({ createdAt: -1 })
            .lean();

        return shares.map((share) => this.toView(share));
    }

    async findUsableSharesForRoom(roomId: string, sourceIds: string[] = []) {
        const filter: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
        };

        if (sourceIds.length > 0) {
            const validIds = sourceIds.filter((id) => Types.ObjectId.isValid(id));
            filter._id = { $in: validIds.map((id) => new Types.ObjectId(id)) };
        }

        return this.shareModel.find(filter).sort({ createdAt: -1 });
    }

    private async resolveOwnedMaterial(studentId: string, dto: CreateRoomShareDto) {
        if (dto.type !== "MATERIAL_REF") {
            return undefined;
        }

        if (!dto.materialId || !Types.ObjectId.isValid(dto.materialId)) {
            throw new BadRequestException("Material inválido.");
        }

        const material = await this.materialModel
            .findOne({
                _id: new Types.ObjectId(dto.materialId),
                userId: new Types.ObjectId(studentId),
            });

        if (!material) {
            throw new NotFoundException("Material não encontrado para este aluno.");
        }

        return material;
    }

    private resolveTextContent(dto: CreateRoomShareDto, material?: MaterialDocument) {
        if (dto.type === "NOTE") {
            return dto.textContent?.trim();
        }

        if (dto.type === "URL") {
            return dto.copiedText?.trim();
        }

        if (material?.status === "READY" && material.contentText?.trim()) {
            return material.contentText.trim();
        }

        return undefined;
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem partilhar na sala.");
        }
    }

    private toView(share: RoomShare | RoomShareDocument) {
        return {
            id: share._id.toString(),
            roomId: share.roomId.toString(),
            authorStudentId: share.authorStudentId.toString(),
            type: share.type,
            title: share.title,
            textContent: share.textContent ?? "",
            sourceUrl: share.sourceUrl ?? "",
            materialId: share.materialId?.toString() ?? "",
            usableByAi: share.usableByAi,
        };
    }
}