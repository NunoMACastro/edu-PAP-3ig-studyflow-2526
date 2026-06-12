import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialIndexService } from "./material-index.service.js";

/**
 * Endpoints de indexação básica de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialIndexController {
    constructor(private readonly indexService: MaterialIndexService) {}

    @Post("student/study-areas/:studyAreaId/materials/:materialId/index-jobs")
    indexPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexPrivateMaterial(
            request.user!,
            studyAreaId,
            materialId,
        );
    }

    @Post("teacher/official-materials/:materialId/index-jobs")
    indexOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.indexService.indexOfficialMaterial(request.user!, materialId);
    }

    @Get("material-index-jobs/:jobId")
    findDone(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
        return this.indexService.findDoneJob(request.user!, jobId);
    }
}
