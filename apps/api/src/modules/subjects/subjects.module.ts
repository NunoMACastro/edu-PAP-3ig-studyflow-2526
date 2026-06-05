// apps/api/src/modules/subjects/subjects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module.js";
import { Subject, SubjectSchema } from "../materials/schemas/subject.schema.js";
import { SubjectsController } from "./subjects.controller.js";
import { SubjectsService } from "./subjects.service.js";

@Module({
    imports: [
        ClassesModule,
        MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}