import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto.js";
import { OfficialMaterialsService } from "./official-materials.service.js";

/**
 * Controller de materiais oficiais.
 */
@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    constructor(private readonly materialsService: OfficialMaterialsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialMaterialDto,
    ) {
        return this.materialsService.createOfficialMaterial(
            request.user!,
            subjectId,
            body,
        );
    }

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.materialsService.listTeacherSubjectMaterials(
            request.user!,
            subjectId,
        );
    }
}
