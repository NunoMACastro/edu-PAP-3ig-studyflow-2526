// apps/api/src/modules/project-ai/schemas/project-ai-plan.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ProjectAiPlanDocument = HydratedDocument<ProjectAiPlan>;

@Schema({ timestamps: true, collection: "project_ai_plans" })
export class ProjectAiPlan {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    projectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    objective!: string;

    @Prop({ type: [String], default: [] })
    steps!: string[];

    @Prop({ type: [String], default: [] })
    sourceProjectSections!: string[];
}

export const ProjectAiPlanSchema = SchemaFactory.createForClass(ProjectAiPlan);
ProjectAiPlanSchema.index({ projectId: 1, studentId: 1, createdAt: -1 });

// apps/api/src/modules/project-ai/dto/project-ai-plan.dto.ts
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProjectAiPlanDto {
    @IsString()
    @MinLength(10)
    @MaxLength(12000)
    objective!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    knownDifficulties?: string[];
}