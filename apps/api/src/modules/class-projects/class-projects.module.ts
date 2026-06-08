// apps/api/src/modules/class-projects/class-projects.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { ClassProjectsTeacherController, ClassProjectsStudentController } from "./class-projects.controller";
import { ClassProjectsService } from "./class-projects.service";
import { ClassProject, ClassProjectSchema } from "./schemas/class-project.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: ClassProject.name, schema: ClassProjectSchema }]), ClassesModule],
    controllers: [ClassProjectsTeacherController, ClassProjectsStudentController],
    providers: [ClassProjectsService],
    exports: [ClassProjectsService],
})
export class ClassProjectsModule {}