// apps/api/src/modules/guided-study-rooms/guided-study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassesModule } from "../classes/classes.module";
import { GuidedStudyRoomsTeacherController, GuidedStudyRoomsStudentController } from "./guided-study-rooms.controller";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service";
import { GuidedStudyRoom, GuidedStudyRoomSchema } from "./schemas/guided-study-room.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: GuidedStudyRoom.name, schema: GuidedStudyRoomSchema }]), ClassesModule],
    controllers: [GuidedStudyRoomsTeacherController, GuidedStudyRoomsStudentController],
    providers: [GuidedStudyRoomsService],
    exports: [GuidedStudyRoomsService],
})
export class GuidedStudyRoomsModule {}