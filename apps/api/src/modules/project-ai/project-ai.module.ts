import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module.js";
import { ClassProjectsModule } from "../class-projects/class-projects.module.js";
import { ProjectAiController } from "./project-ai.controller.js";
import { ProjectAiService } from "./project-ai.service.js";
import { ProjectAiPlan, ProjectAiPlanSchema } from "./schemas/project-ai-plan.schema.js";

@Module({
    imports: [MongooseModule.forFeature([{ name: ProjectAiPlan.name, schema: ProjectAiPlanSchema }]), ClassProjectsModule, AiModule],
    controllers: [ProjectAiController],
    providers: [ProjectAiService],
})
export class ProjectAiModule {}
