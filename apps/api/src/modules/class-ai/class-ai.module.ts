// apps/api/src/modules/class-ai/class-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "../ai/ai.module";
import { OfficialMaterialsModule } from "../official-materials/official-materials.module";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiModule } from "../teacher-ai/teacher-ai.module";
import { ClassAiController } from "./class-ai.controller";
import { ClassAiService } from "./class-ai.service";
import { ClassAiAnswer, ClassAiAnswerSchema } from "./schemas/class-ai-answer.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassAiAnswer.name, schema: ClassAiAnswerSchema }]), SubjectsModule, OfficialMaterialsModule, TeacherAiModule, AiModule],
    controllers: [ClassAiController],
    providers: [ClassAiService],
    exports: [ClassAiService],
})
export class ClassAiModule {}