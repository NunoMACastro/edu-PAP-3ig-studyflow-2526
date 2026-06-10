// apps/api/src/modules/project-ai/project-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { CreateProjectAiPlanDto } from "./dto/project-ai-plan.dto.js";
import { ProjectAiService } from "./project-ai.service.js";

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/projects/:projectId/ai-plan")
export class ProjectAiController {
    constructor(private readonly projectAiService: ProjectAiService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string, @Body() dto: CreateProjectAiPlanDto) {
        return this.projectAiService.createPlan(actor, classId, projectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Param("projectId") projectId: string) {
        return this.projectAiService.listPlans(actor, classId, projectId);
    }
}