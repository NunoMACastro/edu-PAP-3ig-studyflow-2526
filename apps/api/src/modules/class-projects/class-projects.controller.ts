// apps/api/src/modules/class-projects/class-projects.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassProjectsService } from "./class-projects.service";
import { CreateClassProjectDto } from "./dto/class-project.dto";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/projects")
export class ClassProjectsTeacherController {
    constructor(private readonly projectsService: ClassProjectsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateClassProjectDto) {
        return this.projectsService.create(actor, classId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.projectsService.listForTeacher(actor, classId);
    }

    @Patch(":projectId/publish")
    publish(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string) {
        return this.projectsService.publish(actor, classId, projectId);
    }
}

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/projects")
export class ClassProjectsStudentController {
    constructor(private readonly projectsService: ClassProjectsService) {}

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.projectsService.listPublishedForStudent(actor, classId);
    }
}