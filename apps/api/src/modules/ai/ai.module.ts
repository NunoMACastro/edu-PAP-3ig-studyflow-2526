import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module.js";
import { HistoryModule } from "../study/history.module.js";
import { StudyAreasModule } from "../study-areas/study-areas.module.js";
import { AiAreaProfileController } from "./ai-area-profile.controller.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider.js";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema.js";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema.js";
import { StudyToolsController } from "./study-tools.controller.js";
import { StudyToolsService } from "./study-tools.service.js";
import { SummariesController } from "./summaries.controller.js";
import { SummariesService } from "./summaries.service.js";

/**
 * Módulo de IA da MF0.
 *
 * Este é o contrato herdável para MF1: preserva `AiAreaProfileService`,
 * `SummariesService`, `StudyToolsService` e exporta `AI_PROVIDER`.
 */
@Module({
    imports: [
        StudyAreasModule,
        MaterialsModule,
        HistoryModule,
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
        ]),
    ],
    controllers: [
        AiAreaProfileController,
        SummariesController,
        StudyToolsController,
    ],
    providers: [
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [
        AI_PROVIDER,
        AiAreaProfileService,
        SummariesService,
        StudyToolsService,
    ],
})
export class AiModule {}
