// apps/api/src/modules/official-tests/official-tests.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/official-test.dto.js";
import { OfficialTestsService } from "./official-tests.service.js";

@UseGuards(SessionGuard)
@Controller("api/teacher/subjects/:subjectId/tests")
export class OfficialTestsController {
    constructor(private readonly testsService: OfficialTestsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Body() dto: CreateOfficialTestDto) {
        return this.testsService.create(actor, subjectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.testsService.listForTeacher(actor, subjectId);
    }
}