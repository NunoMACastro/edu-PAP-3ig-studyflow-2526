// apps/api/src/modules/project-ai/project-ai.service.ts
import { ForbiddenException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { AI_PROVIDER, AiProvider } from "../ai/providers/ai-provider";
import { ClassProjectsService } from "../class-projects/class-projects.service";
import { CreateProjectAiPlanDto } from "./dto/project-ai-plan.dto";
import { ProjectAiPlan, ProjectAiPlanDocument } from "./schemas/project-ai-plan.schema";

@Injectable()
export class ProjectAiService {
    constructor(
        @InjectModel(ProjectAiPlan.name)
        private readonly plans: Model<ProjectAiPlanDocument>,
        private readonly classProjectsService: ClassProjectsService,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
    ) {}

    async createPlan(actor: AuthenticatedUser, classId: string, projectId: string, dto: CreateProjectAiPlanDto) {
        this.assertStudent(actor);
        const project = await this.classProjectsService.findPublishedForStudent(actor, classId, projectId);
        const text = await this.generatePlan(project.brief, dto);
        const steps = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
        const plan = await this.plans.create({
            classId: project.classId,
            projectId: project._id,
            studentId: new Types.ObjectId(actor.id),
            objective: dto.objective.trim(),
            steps,
            sourceProjectSections: [project._id.toString()],
        });
        return this.toView(plan);
    }

    async listPlans(actor: AuthenticatedUser, classId: string, projectId: string) {
        this.assertStudent(actor);
        const project = await this.classProjectsService.findPublishedForStudent(actor, classId, projectId);
        const plans = await this.plans.find({ projectId: project._id, studentId: new Types.ObjectId(actor.id) }).sort({ createdAt: -1 }).lean();
        return plans.map((plan) => this.toView(plan));
    }

    private async generatePlan(projectBrief: string, dto: CreateProjectAiPlanDto) {
        try {
            return await this.aiProvider.generateText({
                system: "Ajuda o aluno a decompor o projeto em passos graduais, sem fazer o trabalho por ele.",
                user: [
                    "Enunciado: " + projectBrief,
                    "Objetivo do aluno: " + dto.objective,
                    "Dificuldades: " + (dto.knownDifficulties ?? []).join(", "),
                ].join("\n"),
                sources: [{ id: "class-project", title: "Projeto publicado" }],
            });
        } catch (error) {
            throw new ServiceUnavailableException("Não foi possível gerar o plano do projeto neste momento.");
        }
    }

    private assertStudent(actor: AuthenticatedUser) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException("Apenas alunos podem pedir plano de projeto.");
        }
    }

    private toView(plan: ProjectAiPlan) {
        return { id: plan._id.toString(), objective: plan.objective, steps: plan.steps, sourceProjectSections: plan.sourceProjectSections };
    }
}