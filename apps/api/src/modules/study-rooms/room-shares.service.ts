import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { Material, MaterialDocument } from "../materials/schemas/material.schema.js";
import { CreateRoomShareDto } from "./dto/create-room-share.dto.js";
import { RoomShare, RoomShareDocument } from "./schemas/room-share.schema.js";
import { StudyRoomsService } from "./study-rooms.service.js";

export type RoomShareSource = {
    shareId: string;
    title: string;
    contentText: string;
};

type RoomShareView = {
    _id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent?: string;
    url?: string;
    materialId?: string;
    materialTitle?: string;
    usableByAi: boolean;
    createdAt?: Date;
};

/**
 * Serviço de partilhas dentro de salas de estudo.
 */
@Injectable()
export class RoomSharesService {
    constructor(
        @InjectModel(RoomShare.name)
        private readonly shareModel: Model<RoomShareDocument>,
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyRoomsService: StudyRoomsService,
    ) {}

    async createShare(
        actor: AuthenticatedUser,
        roomId: string,
        input: CreateRoomShareDto,
    ): Promise<RoomShareView> {
        await this.studyRoomsService.ensureMember(actor.id, roomId);

        const base = {
            roomId: new Types.ObjectId(roomId),
            authorStudentId: new Types.ObjectId(actor.id),
            type: input.type,
            title: input.title.trim(),
        };

        if (input.type === "NOTE") {
            const textContent = input.textContent?.trim();
            if (!textContent) throw this.invalidSharePayload();
            const share = await this.shareModel.create({
                ...base,
                textContent,
                usableByAi: true,
            });
            return this.toShareView(share.toObject());
        }

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            const copiedText = input.copiedText?.trim();
            const share = await this.shareModel.create({
                ...base,
                url,
                textContent: copiedText || undefined,
                usableByAi: Boolean(copiedText),
            });
            return this.toShareView(share.toObject());
        }

        const material = await this.findOwnMaterial(actor.id, input.materialId);
        const usableByAi = material.status === "READY" && Boolean(material.contentText);
        const share = await this.shareModel.create({
            ...base,
            materialId: material._id,
            materialTitle: material.title,
            textContent: usableByAi ? material.contentText : undefined,
            usableByAi,
        });
        return this.toShareView(share.toObject());
    }

    async listRoomShares(
        actor: AuthenticatedUser,
        roomId: string,
    ): Promise<RoomShareView[]> {
        await this.studyRoomsService.ensureMember(actor.id, roomId);
        const shares = await this.shareModel
            .find({ roomId: new Types.ObjectId(roomId) })
            .sort({ createdAt: -1 })
            .lean();
        return shares.map((share) => this.toShareView(share));
    }

    /**
     * Lista fontes processáveis autorizadas para IA da sala.
     *
     * @param studentId Aluno autenticado.
     * @param roomId Sala onde membership é obrigatória.
     * @param sourceIds Filtro opcional enviado pelo aluno.
     * @returns Fontes textuais da sala.
     */
    async findUsableSharesForRoom(
        studentId: string,
        roomId: string,
        sourceIds?: string[],
    ): Promise<RoomShareSource[]> {
        await this.studyRoomsService.ensureMember(studentId, roomId);
        const query: Record<string, unknown> = {
            roomId: new Types.ObjectId(roomId),
            usableByAi: true,
            textContent: { $exists: true, $ne: "" },
        };

        if (sourceIds && sourceIds.length > 0) {
            const validIds = sourceIds.filter((sourceId) =>
                Types.ObjectId.isValid(sourceId),
            );
            if (validIds.length === 0) {
                throw new BadRequestException({
                    code: "INVALID_SOURCE_IDS",
                    message: "Seleciona fontes válidas.",
                });
            }
            query._id = { $in: validIds.map((sourceId) => new Types.ObjectId(sourceId)) };
        }

        const shares = await this.shareModel.find(query).sort({ createdAt: -1 }).lean();
        return shares.map((share) => ({
            shareId: String(share._id),
            title: share.title,
            contentText: share.textContent!,
        }));
    }

    private async findOwnMaterial(studentId: string, materialId?: string) {
        if (!materialId || !Types.ObjectId.isValid(materialId)) {
            throw this.materialNotFound();
        }

        const material = await this.materialModel
            .findOne({
                _id: materialId,
                userId: new Types.ObjectId(studentId),
            })
            .lean();

        if (!material) throw this.materialNotFound();
        return material;
    }

    private parseSafeUrl(value?: string): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("invalid protocol");
            }
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_ROOM_SHARE_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }

    private invalidSharePayload(): BadRequestException {
        return new BadRequestException({
            code: "INVALID_ROOM_SHARE_PAYLOAD",
            message: "A partilha não tem conteúdo válido.",
        });
    }

    private materialNotFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_NOT_FOUND",
            message: "Material não encontrado.",
        });
    }

    private toShareView(share: {
        _id: unknown;
        roomId: unknown;
        authorStudentId: unknown;
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        url?: string;
        materialId?: unknown;
        materialTitle?: string;
        usableByAi: boolean;
        createdAt?: Date;
    }): RoomShareView {
        return {
            _id: String(share._id),
            roomId: String(share.roomId),
            authorStudentId: String(share.authorStudentId),
            type: share.type,
            title: share.title,
            textContent: share.textContent,
            url: share.url,
            materialId: share.materialId ? String(share.materialId) : undefined,
            materialTitle: share.materialTitle,
            usableByAi: share.usableByAi,
            createdAt: share.createdAt,
        };
    }
}
