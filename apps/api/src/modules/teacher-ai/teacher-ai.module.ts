// apps/api/src/modules/teacher-ai/teacher-ai.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubjectsModule } from "../subjects/subjects.module";
import { TeacherAiVoice, TeacherAiVoiceSchema } from "./schemas/teacher-ai-voice.schema";
import { TeacherAiVoiceController } from "./teacher-ai-voice.controller";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Module({
    imports: [
        SubjectsModule,
        MongooseModule.forFeature([
            { name: TeacherAiVoice.name, schema: TeacherAiVoiceSchema },
        ]),
    ],
    controllers: [TeacherAiVoiceController],
    providers: [TeacherAiVoiceService],
    exports: [TeacherAiVoiceService, MongooseModule],
})
export class TeacherAiModule {}