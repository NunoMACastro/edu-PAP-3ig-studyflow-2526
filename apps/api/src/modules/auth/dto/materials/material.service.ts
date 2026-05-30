import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Express } from "express";
import { Model, Types } from "mongoose";
import { StudyAreasService } from "../study-areas/study-areas.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { Material, MaterialDocument } from "./schemas/material.schema";
import { MaterialStorageService } from "./material-storage.service";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "./validators/material-upload.validator";

@Injectable()
export class MaterialsService {
    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly storage: MaterialStorageService,
    ) {}

    async listByArea(userId: string, studyAreaId: string) {
        await this.assertOwnArea(userId, studyAreaId);
        return this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async submitFile(
        userId: string,
        studyAreaId: string,
        file: Express.Multer.File,
        title?: string,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        validateMaterialUpload(file);

        const storageKey = await this.storage.save(file);
        return this.materialModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: materialTypeFromMime(file.mimetype),
            title: title?.trim() || file.originalname,
            status: "PENDING_PROCESSING",
            storageKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        });
    }

    async submitTextMaterial(
        userId: string,
        studyAreaId: string,
        input: CreateMaterialDto,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        const title = input.title?.trim();
        if (!title)
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            return this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "URL",
                title,
                url,
                status: "PENDING_PROCESSING",
            });
        }

        if (input.type === "TOPIC") {
            const contentText = input.topicText?.trim();
            if (!contentText || contentText.length < 10) {
                throw new BadRequestException({
                    code: "TOPIC_TEXT_REQUIRED",
                    message: "Escreve pelo menos 10 caracteres.",
                });
            }
            return this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "TOPIC",
                title,
                contentText,
                status: "READY",
            });
        }

        throw new BadRequestException({
            code: "INVALID_MATERIAL_TYPE",
            message: "Tipo de material inválido.",
        });
    }

    private async assertOwnArea(
        userId: string,
        studyAreaId: string,
    ): Promise<void> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area)
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
    }

    private parseSafeUrl(value: string | undefined): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol))
                throw new Error("invalid protocol");
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }
}