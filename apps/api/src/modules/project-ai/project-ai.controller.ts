import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateProjectAiPlanDto } from "./dto/create-project-ai-plan.dto.js";
import { ProjectAiService } from "./project-ai.service.js";

/**
 * Endpoints de apoio IA gradual para projectos.
 */
@Controller("api/student/projects/:projectId/ai-plans")
@UseGuards(SessionGuard)
export class ProjectAiController {
    constructor(private readonly projectAiService: ProjectAiService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("projectId") projectId: string,
        @Body() body: CreateProjectAiPlanDto,
    ) {
        return this.projectAiService.createPlan(request.user!, projectId, body);
    }
}
