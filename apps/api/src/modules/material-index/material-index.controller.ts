// apps/api/src/modules/material-index/material-index.controller.ts
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { MaterialIndexService } from "./material-index.service";

@UseGuards(SessionGuard)
@Controller()
export class MaterialIndexController {
    constructor(private readonly indexService: MaterialIndexService) {}

    @Post("api/study-areas/:studyAreaId/materials/:materialId/index")
    startPrivate(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string, @Param("materialId") materialId: string) {
        return this.indexService.startPrivateIndex(actor, studyAreaId, materialId);
    }

    @Post("api/teacher/subjects/:subjectId/materials/:materialId/index")
    startOfficial(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Param("materialId") materialId: string) {
        return this.indexService.startOfficialIndex(actor, subjectId, materialId);
    }

    @Get("api/material-index/jobs/:jobId")
    getJob(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.indexService.getJob(actor, jobId);
    }
}

// apps/api/src/modules/material-index/material-index.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { MaterialIndexController } from "./material-index.controller";
import { MaterialIndexService } from "./material-index.service";
import { MaterialIndexJob, MaterialIndexJobSchema } from "./schemas/material-index-job.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: MaterialIndexJob.name, schema: MaterialIndexJobSchema }]), MaterialsModule, SubjectsModule, OfficialMaterialsModule],
    controllers: [MaterialIndexController],
    providers: [MaterialIndexService],
    exports: [MaterialIndexService],
})
export class MaterialIndexModule {}