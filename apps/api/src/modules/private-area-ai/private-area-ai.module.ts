// apps/api/src/modules/private-area-ai/private-area-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { MaterialsModule } from "../materials/materials.module";
import { StudyAreasModule } from "../study-areas/study-areas.module";
import { PrivateAreaAiController } from "./private-area-ai.controller";
import { PrivateAreaAiService } from "./private-area-ai.service";
import { PrivateAreaAiAnswer, PrivateAreaAiAnswerSchema } from "./schemas/private-area-ai-answer.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: PrivateAreaAiAnswer.name, schema: PrivateAreaAiAnswerSchema }]), StudyAreasModule, MaterialsModule, AiModule],
    controllers: [PrivateAreaAiController],
    providers: [PrivateAreaAiService],
    exports: [PrivateAreaAiService],
})
export class PrivateAreaAiModule {}