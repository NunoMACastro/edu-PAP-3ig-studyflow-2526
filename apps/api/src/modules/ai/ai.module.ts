import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { AiAreaProfileController } from "./ai-area-profile.controller";
import { AiAreaProfileService } from "./ai-area-profile.service";
import { SummariesController } from "./summaries.controller";
import { SummariesService } from "./summaries.service";
import { AI_PROVIDER, OpenAiProvider } from "./providers/ai-provider";
import {
    AiAreaProfile,
    AiAreaProfileSchema,
} from "./schemas/ai-area-profile.schema";
import { AiArtifact, AiArtifactSchema } from "./schemas/ai-artifact.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AiAreaProfile.name, schema: AiAreaProfileSchema },
            { name: AiArtifact.name, schema: AiArtifactSchema },
        ]),
        StudyAreasModule,
        MaterialsModule,
    ],
    controllers: [AiAreaProfileController, SummariesController],
    providers: [
        AiAreaProfileService,
        SummariesService,
        { provide: AI_PROVIDER, useClass: OpenAiProvider },
    ],
    exports: [AiAreaProfileService, SummariesService],
})
export class AiModule {}