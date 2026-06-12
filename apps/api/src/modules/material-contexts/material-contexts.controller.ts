import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialContextsService } from "./material-contexts.service.js";

/**
 * Endpoints de contextos separados de materiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class MaterialContextsController {
    constructor(private readonly contextsService: MaterialContextsService) {}

    @Get("student/study-areas/:studyAreaId/material-context")
    listPrivate(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.contextsService.listPrivateArea(request.user!, studyAreaId);
    }

    @Get("subjects/:subjectId/material-context")
    listOfficial(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.contextsService.listOfficialSubject(request.user!, subjectId);
    }
}
