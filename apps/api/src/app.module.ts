import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./modules/auth/auth.module.js";
import { StudentsModule } from "./modules/students/students.module.js";
import { StudyModule } from "./modules/study/study.module.js";
import { StudyAreasModule } from "./modules/study-rooms/study-rooms.module.js";
import { MaterialsModule } from "./modules/materials/materials.module.js";
import { AiModule } from "./modules/ai/ai.module.js";

/**
 * Módulo raiz da API.
 *
 * A MF0 fica organizada por domínios, conforme RNF25: autenticação, alunos,
 * estudo individual, áreas de estudo, materiais e IA. A ligação MongoDB usa
 * `MONGODB_URI`, mantendo o endpoint local como valor de desenvolvimento.
 */
@Module({
    imports: [
        MongooseModule.forRoot(
            process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studyflow",
        ),
        AuthModule,
        StudentsModule,
        StudyModule,
        StudyAreasModule,
        MaterialsModule,
        AiModule,
    ],
})
export class AppModule {}
