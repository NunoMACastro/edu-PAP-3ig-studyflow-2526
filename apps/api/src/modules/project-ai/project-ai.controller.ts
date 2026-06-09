// apps/api/src/modules/project-ai/project-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateProjectAiPlanDto } from "./dto/project-ai-plan.dto";
import { ProjectAiService } from "./project-ai.service";

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

// apps/api/src/modules/project-ai/project-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";
import { ProjectAiController } from "./project-ai.controller";
import { ProjectAiService } from "./project-ai.service";
import { ProjectAiPlan, ProjectAiPlanSchema } from "./schemas/project-ai-plan.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ProjectAiPlan.name, schema: ProjectAiPlanSchema }]), ClassProjectsModule, AiModule],
    controllers: [ProjectAiController],
    providers: [ProjectAiService],
})
export class ProjectAiModule {}