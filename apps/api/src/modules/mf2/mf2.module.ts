// apps/api/src/modules/mf2/mf2.module.ts
import { Module } from "@nestjs/common";
import { GuidedStudyRoomsModule } from "../guided-study-rooms/guided-study-rooms.module";

@Module({
    imports: [
        GuidedStudyRoomsModule,
    ],
})
export class Mf2Module {}

