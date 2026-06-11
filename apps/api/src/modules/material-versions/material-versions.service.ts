// apps/api/src/modules/material-versions/material-versions.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "../material-index/material-index.service";
import { CreateMaterialVersionDto } from "./dto/material-version.dto";
import { MaterialVersion, MaterialVersionDocument } from "./schemas/material-version.schema";

@Injectable()
export class MaterialVersionsService {
    constructor(
        @InjectModel(MaterialVersion.name)
        private readonly versions: Model<MaterialVersionDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    async create(actor: AuthenticatedUser, jobId: string, dto: CreateMaterialVersionDto) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const latest = await this.versions.findOne({ materialId: job.materialId }).sort({ versionNumber: -1 });
        const version = await this.versions.create({ jobId: job._id, materialId: job.materialId, ownerId: job.ownerId, versionNumber: latest ? latest.versionNumber + 1 : 1, title: dto.title.trim(), changeSummary: dto.changeSummary });
        return this.toView(version);
    }

    async list(actor: AuthenticatedUser, jobId: string) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const versions = await this.versions.find({ materialId: job.materialId, ownerId: job.ownerId }).sort({ versionNumber: -1 }).lean();
        return versions.map((version) => this.toView(version));
    }

    private toView(version: MaterialVersion) {
        return { id: version._id.toString(), materialId: version.materialId.toString(), jobId: version.jobId.toString(), versionNumber: version.versionNumber, title: version.title, changeSummary: version.changeSummary };
    }
}