// apps/api/src/modules/ai/ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { Material, MaterialSchema } from "../materials/schemas/material.schema";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AdaptiveLearningController } from "./adaptive-learning.controller";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider";
import {
    AdaptiveExplanation,
    AdaptiveExplanationSchema,
} from "./schemas/adaptive-explanation.schema";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema";
import { LearningProfile, LearningProfileSchema } from "./schemas/learning-profile.schema";
import { StudyToolsController } from "./study-tools.controller";
import { StudyToolsService } from "./study-tools.service";
import { SummariesController } from "./summaries.controller";
import { SummariesService } from "./summaries.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
            { name: LearningProfile.name, schema: LearningProfileSchema },
            { name: AdaptiveExplanation.name, schema: AdaptiveExplanationSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
        StudyAreasModule,
        MaterialsModule,
    ],
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
        AdaptiveLearningController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        AdaptiveLearningService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [
        AI_PROVIDER,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        AdaptiveLearningService,
    ],
})
export class AiModule {}