// apps/api/src/modules/official-materials/official-materials.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { CreateOfficialMaterialDto } from "./dto/create-official-material.dto";
import { OfficialMaterialsService } from "./official-materials.service";

@Controller("api/teacher/subjects/:subjectId/materials")
@UseGuards(SessionGuard)
export class OfficialMaterialsController {
    constructor(private readonly officialMaterialsService: OfficialMaterialsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: CreateOfficialMaterialDto,
    ) {
        return this.officialMaterialsService.create(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.officialMaterialsService.listForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}