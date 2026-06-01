import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HistoryService } from "../study/history.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { Material, MaterialDocument } from "./schemas/material.schema.js";
import { MaterialStorageService } from "./material-storage.service.js";
import {
    materialTypeFromMime,
    validateMaterialUpload,
} from "./validators/material-upload.validator.js";

/**
 * Serviço de materiais por área de estudo.
 */
@Injectable()
export class MaterialsService {
    constructor(
        @InjectModel(Material.name)
        private readonly materialModel: Model<MaterialDocument>,
        private readonly studyAreasService: StudyAreasService,
        private readonly storage: MaterialStorageService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Lista materiais de uma área pertencente ao aluno.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Materiais da área.
     */
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

    /**
     * Conta materiais do aluno para painéis agregados.
     *
     * @param userId Identificador vindo da sessão.
     * @returns Número de materiais submetidos pelo aluno.
     */
    async countMine(userId: string): Promise<number> {
        return this.materialModel.countDocuments({
            userId: new Types.ObjectId(userId),
        });
    }

    /**
     * Lista materiais prontos e processáveis para IA.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Materiais `READY` com `contentText`.
     */
    async listReadyTextSources(userId: string, studyAreaId: string) {
        await this.assertOwnArea(userId, studyAreaId);
        return this.materialModel
            .find({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                status: "READY",
                contentText: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Submete um PDF ou DOCX.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param file Ficheiro multipart.
     * @param title Título opcional definido pelo aluno.
     * @returns Material criado em estado pendente.
     */
    async submitFile(
        userId: string,
        studyAreaId: string,
        file: Express.Multer.File,
        title?: string,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        validateMaterialUpload(file);

        const storageKey = await this.storage.save(file);
        const material = await this.materialModel.create({
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

        await this.historyService.recordEvent(
            userId,
            "MATERIAL_SUBMITTED",
            "Material submetido",
            material.title,
        );

        return material;
    }

    /**
     * Submete URL ou tópico textual.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param input Dados JSON do material.
     * @returns Material criado.
     */
    async submitTextMaterial(
        userId: string,
        studyAreaId: string,
        input: CreateMaterialDto,
    ) {
        await this.assertOwnArea(userId, studyAreaId);
        const title = input.title?.trim();
        if (!title) {
            throw new BadRequestException({
                code: "TITLE_REQUIRED",
                message: "Indica um título.",
            });
        }

        if (input.type === "URL") {
            const url = this.parseSafeUrl(input.url);
            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "URL",
                title,
                url,
                status: "PENDING_PROCESSING",
            });
            await this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "URL submetido",
                title,
            );
            return material;
        }

        if (input.type === "TOPIC") {
            const contentText = input.topicText?.trim();
            if (!contentText || contentText.length < 10) {
                throw new BadRequestException({
                    code: "TOPIC_TEXT_REQUIRED",
                    message: "Escreve pelo menos 10 caracteres.",
                });
            }

            const material = await this.materialModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type: "TOPIC",
                title,
                contentText,
                status: "READY",
            });
            await this.historyService.recordEvent(
                userId,
                "MATERIAL_SUBMITTED",
                "Tópico submetido",
                title,
            );
            return material;
        }

        throw new BadRequestException({
            code: "INVALID_MATERIAL_TYPE",
            message: "Tipo de material inválido.",
        });
    }

    /**
     * Garante que a área pertence ao aluno autenticado.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Nada quando a área é válida.
     */
    private async assertOwnArea(
        userId: string,
        studyAreaId: string,
    ): Promise<void> {
        const area = await this.studyAreasService.getMyStudyArea(
            userId,
            studyAreaId,
        );
        if (!area) {
            throw new NotFoundException({
                code: "STUDY_AREA_NOT_FOUND",
                message: "Área de estudo não encontrada.",
            });
        }
    }

    /**
     * Valida URLs aceitando apenas HTTP e HTTPS.
     *
     * @param value Valor recebido do DTO.
     * @returns URL normalizado.
     */
    private parseSafeUrl(value: string | undefined): string {
        try {
            const url = new URL(String(value ?? ""));
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("invalid protocol");
            }
            return url.toString();
        } catch {
            throw new BadRequestException({
                code: "INVALID_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }
}
