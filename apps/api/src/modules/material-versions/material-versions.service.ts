import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    MaterialIndexJobView,
    MaterialIndexService,
} from "../material-index/material-index.service.js";
import { CreateMaterialVersionDto } from "./dto/material-version.dto.js";
import {
    MaterialVersion,
    MaterialVersionChunk,
    MaterialVersionDocument,
    MaterialVersionScope,
} from "./schemas/material-version.schema.js";

export type MaterialVersionView = {
    _id: string;
    scope: MaterialVersionScope;
    materialId: string;
    jobId: string;
    versionNumber: number;
    title: string;
    textSnapshot: string;
    chunksSnapshot: MaterialVersionChunk[];
    changeSummary?: string;
    active: boolean;
    createdAt?: Date;
};

/**
 * Serviço de versões rastreáveis criadas a partir de jobs concluídos.
 */
@Injectable()
export class MaterialVersionsService {
    constructor(
        @InjectModel(MaterialVersion.name)
        private readonly versionModel: Model<MaterialVersionDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    async createFromJob(
        actor: AuthenticatedUser,
        jobId: string,
        input: CreateMaterialVersionDto = {},
    ): Promise<MaterialVersionView> {
        const job = await this.indexService.findDoneJob(actor, jobId);
        return this.createVersionFromJob(job, input);
    }

    async listForJob(
        actor: AuthenticatedUser,
        jobId: string,
    ): Promise<MaterialVersionView[]> {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const versions = await this.versionModel
            .find({
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            })
            .sort({ versionNumber: -1 })
            .lean();
        return versions.map((version) => this.toView(version));
    }

    async restoreVersion(
        actor: AuthenticatedUser,
        jobId: string,
        versionId: string,
    ): Promise<MaterialVersionView> {
        const job = await this.indexService.findDoneJob(actor, jobId);
        if (!Types.ObjectId.isValid(versionId)) throw this.notFound();
        const version = await this.versionModel.findOne({
            _id: versionId,
            materialId: new Types.ObjectId(job.materialId),
            scope: job.scope,
        });
        if (!version) throw this.notFound();

        await this.versionModel.updateMany(
            {
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            },
            { $set: { active: false } },
        );
        version.active = true;
        await version.save();
        return this.toView(version.toObject());
    }

    async createPrivateVersion(
        actor: AuthenticatedUser,
        _studyAreaId: string,
        _materialId: string,
    ): Promise<never> {
        if (actor.role !== "STUDENT") throw this.roleError("STUDENT");
        throw new ForbiddenException({
            code: "MATERIAL_VERSION_REQUIRES_INDEX_JOB",
            message: "Cria versões a partir de um job de indexação concluído.",
        });
    }

    async createOfficialVersion(
        actor: AuthenticatedUser,
        _materialId: string,
    ): Promise<never> {
        if (actor.role !== "TEACHER") throw this.roleError("TEACHER");
        throw new ForbiddenException({
            code: "MATERIAL_VERSION_REQUIRES_INDEX_JOB",
            message: "Cria versões a partir de um job de indexação concluído.",
        });
    }

    private async createVersionFromJob(
        job: MaterialIndexJobView,
        input: CreateMaterialVersionDto,
    ): Promise<MaterialVersionView> {
        const last = await this.versionModel
            .findOne({
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            })
            .sort({ versionNumber: -1 })
            .lean();
        await this.versionModel.updateMany(
            {
                materialId: new Types.ObjectId(job.materialId),
                scope: job.scope,
            },
            { $set: { active: false } },
        );
        const title =
            input.title?.trim() ||
            job.extractedTextChunks[0]?.sourceLabel ||
            `Versão ${Number(last?.versionNumber ?? 0) + 1}`;
        const version = await this.versionModel.create({
            scope: job.scope,
            materialId: new Types.ObjectId(job.materialId),
            jobId: new Types.ObjectId(job._id),
            studyAreaId: job.studyAreaId
                ? new Types.ObjectId(job.studyAreaId)
                : undefined,
            subjectId: job.subjectId ? new Types.ObjectId(job.subjectId) : undefined,
            userId: job.userId ? new Types.ObjectId(job.userId) : undefined,
            teacherId: job.teacherId ? new Types.ObjectId(job.teacherId) : undefined,
            versionNumber: Number(last?.versionNumber ?? 0) + 1,
            title,
            textSnapshot: job.extractedTextChunks
                .map((chunk) => chunk.text)
                .join("\n\n")
                .slice(0, 20000),
            chunksSnapshot: job.extractedTextChunks,
            changeSummary: input.changeSummary?.trim(),
            active: true,
        });
        return this.toView(version.toObject());
    }

    private roleError(role: "STUDENT" | "TEACHER"): ForbiddenException {
        return new ForbiddenException({
            code: `${role}_ROLE_REQUIRED`,
            message:
                role === "STUDENT"
                    ? "Esta funcionalidade é exclusiva de alunos."
                    : "Esta funcionalidade é exclusiva de professores.",
        });
    }

    private notFound(): NotFoundException {
        return new NotFoundException({
            code: "MATERIAL_VERSION_NOT_FOUND",
            message: "Versão de material não encontrada.",
        });
    }

    private toView(version: {
        _id: unknown;
        scope: MaterialVersionScope;
        materialId: unknown;
        jobId: unknown;
        versionNumber: number;
        title: string;
        textSnapshot?: string;
        chunksSnapshot?: MaterialVersionChunk[];
        changeSummary?: string;
        active?: boolean;
        createdAt?: Date;
    }): MaterialVersionView {
        return {
            _id: String(version._id),
            scope: version.scope,
            materialId: String(version.materialId),
            jobId: String(version.jobId),
            versionNumber: version.versionNumber,
            title: version.title,
            textSnapshot: version.textSnapshot ?? "",
            chunksSnapshot: version.chunksSnapshot ?? [],
            changeSummary: version.changeSummary,
            active: version.active ?? false,
            createdAt: version.createdAt,
        };
    }
}
