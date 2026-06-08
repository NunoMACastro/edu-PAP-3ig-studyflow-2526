// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";
import { ClassProjectsModule } from "../class-projects/class-projects.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
        ClassProjectsModule,
    ],
})
export class Mf2Module {}
