import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialsService } from "../materials/materials.service.js";
import { OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    MaterialContext,
    MaterialContextDocument,
    MaterialContextScope,
} from "./schemas/material-context.schema.js";

type MaterialContextInput = {
    scope: MaterialContextScope;
    contextId: string;
    materialId: string;
    title: string;
    source: "student" | "teacher" | "class";
    studentId?: string;
    teacherId?: string;
};

export type MaterialContextView = {
    _id: string;
    scope: MaterialContextScope;
    contextId: string;
    materialId: string;
    title: string;
    source: "student" | "teacher" | "class";
    studentId?: string;
    teacherId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

/**
 * Serviço de separação de contextos de materiais.
 */
@Injectable()
export class MaterialContextsService {
    constructor(
        @InjectModel(MaterialContext.name)
        private readonly contextModel: Model<MaterialContextDocument>,
        private readonly materialsService: MaterialsService,
        private readonly officialMaterialsService: OfficialMaterialsService,
        private readonly subjectsService: SubjectsService,
    ) {}

    async listPrivateArea(actor: AuthenticatedUser, studyAreaId: string) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const materials = await this.materialsService.listByArea(
            actor.id,
            studyAreaId,
        );
        const contexts = await Promise.all(
            materials.map((material) =>
                this.upsertContext({
                    scope: "PRIVATE_AREA",
                    contextId: studyAreaId,
                    materialId: material._id,
                    title: material.title,
                    source: "student",
                    studentId: actor.id,
                }),
            ),
        );
        return {
            context: "PRIVATE_AREA",
            studyAreaId,
            materials: contexts,
            contexts,
        };
    }

    async listOfficialSubject(actor: AuthenticatedUser, subjectId: string) {
        if (actor.role === "STUDENT") {
            const { subject } = await this.subjectsService.findSubjectForStudent(
                actor.id,
                subjectId,
            );
            const materials =
                await this.officialMaterialsService.findProcessedBySubject(
                    subject._id,
                );
            const contexts = await Promise.all(
                materials.map((material) =>
                    this.upsertContext({
                        scope: "OFFICIAL_SUBJECT",
                        contextId: subject._id,
                        materialId: material._id,
                        title: material.title,
                        source: "class",
                        studentId: actor.id,
                        teacherId: material.teacherId,
                    }),
                ),
            );
            return {
                context: "OFFICIAL_SUBJECT",
                subjectId: subject._id,
                materials: contexts,
                contexts,
            };
        }
        if (actor.role === "TEACHER") {
            const subject = await this.subjectsService.findOwnedSubject(
                actor.id,
                subjectId,
            );
            const materials =
                await this.officialMaterialsService.listTeacherSubjectMaterials(
                    actor,
                    subject._id,
                );
            const contexts = await Promise.all(
                materials.map((material) =>
                    this.upsertContext({
                        scope: "OFFICIAL_SUBJECT",
                        contextId: subject._id,
                        materialId: material._id,
                        title: material.title,
                        source: "teacher",
                        teacherId: actor.id,
                    }),
                ),
            );
            return {
                context: "OFFICIAL_SUBJECT",
                subjectId: subject._id,
                materials: contexts,
                contexts,
            };
        }
        throw new ForbiddenException({
            code: "ROLE_NOT_SUPPORTED",
            message: "Este papel não pode listar contextos de materiais.",
        });
    }

    private async upsertContext(
        input: MaterialContextInput,
    ): Promise<MaterialContextView> {
        const context = await this.contextModel
            .findOneAndUpdate(
                {
                    scope: input.scope,
                    contextId: new Types.ObjectId(input.contextId),
                    materialId: new Types.ObjectId(input.materialId),
                },
                {
                    $set: {
                        title: input.title,
                        source: input.source,
                        studentId: input.studentId
                            ? new Types.ObjectId(input.studentId)
                            : undefined,
                        teacherId: input.teacherId
                            ? new Types.ObjectId(input.teacherId)
                            : undefined,
                    },
                    $setOnInsert: {
                        scope: input.scope,
                        contextId: new Types.ObjectId(input.contextId),
                        materialId: new Types.ObjectId(input.materialId),
                    },
                },
                { new: true, upsert: true },
            )
            .lean<MaterialContext & { _id: Types.ObjectId }>();

        return this.toView(context);
    }

    private toView(
        context: MaterialContext & { _id: Types.ObjectId },
    ): MaterialContextView {
        return {
            _id: context._id.toString(),
            scope: context.scope,
            contextId: context.contextId.toString(),
            materialId: context.materialId.toString(),
            title: context.title,
            source: context.source,
            studentId: context.studentId?.toString(),
            teacherId: context.teacherId?.toString(),
            createdAt: context.createdAt,
            updatedAt: context.updatedAt,
        };
    }
}
