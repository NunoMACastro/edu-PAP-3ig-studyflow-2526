// apps/api/src/modules/material-structure/material-structure.controller.ts
/// <reference path="./ambient.d.ts" />
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateMaterialStructureDto } from "../dto/material-structure.dto";
import { MaterialStructureService } from "./material-structure.service";

@UseGuards(SessionGuard)
@Controller("api/material-index/jobs/:jobId/structure")
export class MaterialStructureController {
    constructor(private readonly structureService: MaterialStructureService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string, @Body() dto: CreateMaterialStructureDto) {
        return this.structureService.create(actor, jobId, dto);
    }

    @Get()
    get(@CurrentUser() actor: AuthenticatedUser, @Param("jobId") jobId: string) {
        return this.structureService.get(actor, jobId);
    }
}