// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module.js";
import { ClassesModule } from "./modules/classes/classes.module.js";
import { SubjectsModule } from "./modules/subjects/subjects.module.js";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module.js";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module.js";
import { ClassAiModule } from "./modules/class-ai/class-ai.module.js";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module.js";
import { Mf2Module } from "./modules/mf2/mf2.module.js";

@Module({
    imports: [
        AuthModule,
        StudentsModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
        StudyModule,
        StudyRoomsModule,
        ClassesModule,
        SubjectsModule,
        OfficialMaterialsModule,
        TeacherAiModule,
        ClassAiModule,
        ClassPostsModule,
        Mf2Module,
    ],
})
export class AppModule {}