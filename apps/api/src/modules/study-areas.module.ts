import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { StudyArea, StudyAreaSchema } from "./schemas/study-area.schema";
import { StudyAreasController } from "./study-areas.controller";
import { StudyAreasService } from "./study-areas.service";

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            { name: StudyArea.name, schema: StudyAreaSchema },
        ]),
    ],
    controllers: [StudyAreasController],
    providers: [StudyAreasService],
    exports: [StudyAreasService],
})
export class StudyAreasModule {}