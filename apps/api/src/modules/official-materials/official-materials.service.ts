// apps/api/src/modules/official-materials/official-materials.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { Subject } from "../subjects/schemas/subject.schema";
import { SubjectsService } from "../subjects/subjects.service";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import {
    OfficialMaterial,
    OfficialMaterialDocument,
} from "./schemas/official-material.schema";

@Injectable()
export class OfficialMaterialsService {
    constructor(
        @InjectModel(OfficialMaterial.name)
        private readonly materialModel: Model<OfficialMaterialDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    async create(actor: AuthenticatedUser, subjectId: string, dto: CreateOfficialMaterialDto) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const material = await this.materialModel.create({
            subjectId: subject._id,
            classId: subject.classId,
            teacherId: new Types.ObjectId(actor.id),
            title: dto.title.trim(),
            type: dto.type,
            textContent: dto.type === "TEXT" ? dto.textContent?.trim() : undefined,
            sourceUrl: dto.type === "URL" ? dto.sourceUrl?.trim() : undefined,
            status: dto.type === "TEXT" ? "PROCESSED" : "REFERENCE_ONLY",
        });

        return this.toView(material);
    }

    async listForTeacher(actor: AuthenticatedUser, subjectId: string) {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(actor.id, subjectId);

        const materials = await this.materialModel
            .find({ subjectId: subject._id, teacherId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();

        return materials.map((material) => this.toView(material));
    }

    async findProcessedBySubject(subject: Subject) {
        return this.materialModel
            .find({ subjectId: subject._id, status: "PROCESSED" })
            .sort({ createdAt: -1 });
    }

    private assertTeacher(actor: AuthenticatedUser) {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException("Apenas professores podem gerir materiais oficiais.");
        }
    }

    private toView(material: OfficialMaterial | OfficialMaterialDocument) {
        return {
            id: material._id.toString(),
            subjectId: material.subjectId.toString(),
            classId: material.classId.toString(),
            teacherId: material.teacherId.toString(),
            title: material.title,
            type: material.type,
            textContent: material.textContent ?? "",
            sourceUrl: material.sourceUrl ?? "",
            status: material.status,
        };
    }
}