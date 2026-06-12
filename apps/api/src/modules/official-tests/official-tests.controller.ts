import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { OfficialTestsService } from "./official-tests.service.js";

/**
 * Endpoints docentes de testes oficiais.
 */
@Controller("api/teacher/subjects/:subjectId/tests")
@UseGuards(SessionGuard)
export class OfficialTestsController {
    constructor(private readonly testsService: OfficialTestsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateOfficialTestDto,
    ) {
        return this.testsService.create(request.user!, subjectId, body);
    }

    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.testsService.listForTeacher(request.user!, subjectId);
    }
}
