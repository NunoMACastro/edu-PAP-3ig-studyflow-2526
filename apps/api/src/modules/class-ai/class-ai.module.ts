// apps/api/src/modules/class-ai/class-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module";
import { ClassAiController } from "./class-ai.controller";
import { ClassAiService } from "./class-ai.service";
import {
    ClassAiInteraction,
    ClassAiInteractionSchema,
} from "./schemas/class-ai-interaction.schema";

@Module({
    imports: [
        AiModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        MongooseModule.forFeature([
            { name: ClassAiInteraction.name, schema: ClassAiInteractionSchema },
        ]),
    ],
    controllers: [ClassAiController],
    providers: [ClassAiService],
})
export class ClassAiModule {}