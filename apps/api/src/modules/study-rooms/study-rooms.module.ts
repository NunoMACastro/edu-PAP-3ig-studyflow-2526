// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [StudyRoomsController],
    providers: [StudyRoomsService],
    exports: [StudyRoomsService, MongooseModule],
})
export class StudyRoomsModule {}

// Legacy alias for modules importing StudyAreasModule
export { StudyRoomsModule as StudyAreasModule };