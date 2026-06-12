import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateMaterialVersionDto } from "./dto/material-version.dto.js";
import { MaterialVersionsService } from "./material-versions.service.js";

/**
 * Endpoints de versões de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialVersionsController {
    constructor(private readonly versionsService: MaterialVersionsService) {}

    @Post("material-index-jobs/:jobId/versions")
    createFromJob(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
        @Body() input: CreateMaterialVersionDto,
    ) {
        return this.versionsService.createFromJob(request.user!, jobId, input);
    }

    @Get("material-index-jobs/:jobId/versions")
    listForJob(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
    ) {
        return this.versionsService.listForJob(request.user!, jobId);
    }

    @Patch("material-index-jobs/:jobId/versions/:versionId/restore")
    restoreVersion(
        @Req() request: AuthenticatedRequest,
        @Param("jobId") jobId: string,
        @Param("versionId") versionId: string,
    ) {
        return this.versionsService.restoreVersion(
            request.user!,
            jobId,
            versionId,
        );
    }

    @Post("student/study-areas/:studyAreaId/materials/:materialId/versions")
    createPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Param("materialId") materialId: string,
    ) {
        return this.versionsService.createPrivateVersion(
            request.user!,
            studyAreaId,
            materialId,
        );
    }

    @Post("teacher/official-materials/:materialId/versions")
    createOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("materialId") materialId: string,
    ) {
        return this.versionsService.createOfficialVersion(request.user!, materialId);
    }
}
