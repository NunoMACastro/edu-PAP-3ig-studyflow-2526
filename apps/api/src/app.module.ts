// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { StudentsModule } from "./modules/students/students.module";
import { StudyAreasModule } from "./modules/study-areas/study-areas.module";
import { MaterialsModule } from "./modules/materials/materials.module";
import { AiModule } from "./modules/ai/ai.module";
import { StudyModule } from "./modules/study/study.module";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { SubjectsModule } from "./modules/subjects/subjects.module";
import { OfficialMaterialsModule } from "./modules/official-materials/official-materials.module";
import { TeacherAiModule } from "./modules/teacher-ai/teacher-ai.module";
import { ClassAiModule } from "./modules/class-ai/class-ai.module";
import { ClassPostsModule } from "./modules/class-posts/class-posts.module";
import { Mf2Module } from "./modules/mf2/mf2.module";

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