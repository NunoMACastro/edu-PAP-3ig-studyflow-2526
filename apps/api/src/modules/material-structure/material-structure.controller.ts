import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { MaterialStructureService } from "./material-structure.service.js";

/**
 * Endpoints de estruturação de materiais.
 */
@Controller("api/material-index-jobs/:jobId/structure")
@UseGuards(SessionGuard)
export class MaterialStructureController {
    constructor(private readonly structureService: MaterialStructureService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Param("jobId") jobId: string) {
        return this.structureService.createFromJob(request.user!, jobId);
    }
}
