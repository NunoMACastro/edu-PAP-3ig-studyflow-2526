import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto.js";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
    OfficialMaterialStatus,
    OfficialMaterialType,
} from "./schemas/official-material.schema.js";
import { SubjectsService } from "../subjects/subjects.service.js";

export type OfficialMaterialView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    type: OfficialMaterialType;
    status: OfficialMaterialStatus;
    textContent?: string;
    sourceUrl?: string;
    createdAt?: Date;
};

/**
 * Serviço de materiais oficiais por disciplina.
 */
@Injectable()
export class OfficialMaterialsService {
    constructor(
        @InjectModel(OfficialMaterial.name)
        private readonly materialModel: Model<OfficialMaterialDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async createOfficialMaterial(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialMaterialDto,
    ): Promise<OfficialMaterialView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );

        const material = await this.materialModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            type: input.type,
            status: input.type === "TEXT" ? "PROCESSED" : "REFERENCE_ONLY",
            textContent:
                input.type === "TEXT"
                    ? this.cleanTextContent(input.textContent)
                    : undefined,
            sourceUrl:
                input.type === "URL" ? this.parseSafeUrl(input.sourceUrl) : undefined,
        });

        return this.toMaterialView(material.toObject());
    }

    async listTeacherSubjectMaterials(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialMaterialView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const materials = await this.materialModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) => this.toMaterialView(material));
    }

    async listProcessedForSubject(subjectId: string): Promise<OfficialMaterialView[]> {
        const materials = await this.materialModel
            .find({
                subjectId: new Types.ObjectId(subjectId),
                status: "PROCESSED",
                textContent: { $exists: true, $ne: "" },
            })
            .sort({ createdAt: -1 })
            .lean();
        return materials.map((material) => this.toMaterialView(material));
    }

    /**
     * Alias explícito para BKs MF2 que consomem materiais processados.
     *
     * @param subjectId Disciplina oficial.
     * @returns Materiais oficiais com texto processável.
     */
    async findProcessedBySubject(
        subjectId: string,
    ): Promise<OfficialMaterialView[]> {
        return this.listProcessedForSubject(subjectId);
    }

    /**
     * Obtém um material oficial validando que pertence ao professor.
     *
     * @param teacherId Professor autenticado.
     * @param materialId Material oficial.
     * @returns Material oficial público.
     */
    async findOwnedMaterial(
        teacherId: string,
        materialId: string,
    ): Promise<OfficialMaterialView> {
        if (!Types.ObjectId.isValid(materialId)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_ID",
                message: "Material oficial inválido.",
            });
        }

        const material = await this.materialModel
            .findOne({
                _id: materialId,
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!material) {
            throw new BadRequestException({
                code: "OFFICIAL_MATERIAL_NOT_FOUND",
                message: "Material oficial não encontrado.",
            });
        }
        return this.toMaterialView(material);
    }

    /**
     * Marca um material oficial como processado depois de indexação textual.
     *
     * @param teacherId Professor autenticado.
     * @param materialId Material oficial.
     * @param textContent Texto extraído.
     * @returns Nada.
     */
    async markIndexedText(
        teacherId: string,
        materialId: string,
        textContent: string,
    ): Promise<void> {
        await this.materialModel.updateOne(
            {
                _id: new Types.ObjectId(materialId),
                teacherId: new Types.ObjectId(teacherId),
            },
            {
                $set: {
                    status: "PROCESSED",
                    textContent: textContent.slice(0, 20000),
                },
            },
        );
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
                code: "INVALID_OFFICIAL_MATERIAL_URL",
                message: "Indica um URL http ou https válido.",
            });
        }
    }

    private cleanTextContent(value?: string): string {
        const textContent = value?.trim() ?? "";
        if (textContent.length < 20) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_MATERIAL_TEXT",
                message: "Indica texto oficial com conteúdo suficiente.",
            });
        }
        return textContent;
    }

    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    private toMaterialView(material: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        type: OfficialMaterialType;
        status: OfficialMaterialStatus;
        textContent?: string;
        sourceUrl?: string;
        createdAt?: Date;
    }): OfficialMaterialView {
        return {
            _id: String(material._id),
            subjectId: String(material.subjectId),
            classId: String(material.classId),
            teacherId: String(material.teacherId),
            title: material.title,
            type: material.type,
            status: material.status,
            textContent: material.textContent,
            sourceUrl: material.sourceUrl,
            createdAt: material.createdAt,
        };
    }
}
