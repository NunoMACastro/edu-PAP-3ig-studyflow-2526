import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassProjectsService } from "./class-projects.service.js";
import { CreateClassProjectDto } from "./dto/create-class-project.dto.js";

/**
 * Endpoints de projectos oficiais da turma.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassProjectsController {
    constructor(private readonly projectsService: ClassProjectsService) {}

    @Post("teacher/classes/:classId/projects")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateClassProjectDto,
    ) {
        return this.projectsService.create(request.user!, classId, body);
    }

    @Get("teacher/classes/:classId/projects")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.projectsService.listForTeacher(request.user!, classId);
    }

    @Get("student/classes/:classId/projects")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.projectsService.listPublishedForStudent(request.user!, classId);
    }
}
