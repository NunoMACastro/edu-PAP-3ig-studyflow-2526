// apps/api/src/modules/class-projects/class-projects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module.js";
import { ClassProjectsTeacherController, ClassProjectsStudentController } from "./class-projects.controller.js";
import { ClassProjectsService } from "./class-projects.service.js";
import { ClassProject, ClassProjectSchema } from "./schemas/class-project.schema.js";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassProject.name, schema: ClassProjectSchema }]), ClassesModule],
    controllers: [ClassProjectsTeacherController, ClassProjectsStudentController],
    providers: [ClassProjectsService],
    exports: [ClassProjectsService],
})
export class ClassProjectsModule {}