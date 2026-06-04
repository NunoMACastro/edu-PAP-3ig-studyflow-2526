// apps/api/src/modules/study-rooms/study-rooms.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Material, MaterialSchema } from "../materials/schemas/material.schema";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { RoomSharesController } from "./room-shares.controller";
import { RoomSharesService } from "./room-shares.service";
import { RoomShare, RoomShareSchema } from "./schemas/room-share.schema";
import { StudyRoom, StudyRoomSchema } from "./schemas/study-room.schema";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StudyRoom.name, schema: StudyRoomSchema },
            { name: RoomShare.name, schema: RoomShareSchema },
            { name: User.name, schema: UserSchema },
            { name: Material.name, schema: MaterialSchema },
        ]),
    ],
    controllers: [StudyRoomsController, RoomSharesController],
    providers: [StudyRoomsService, RoomSharesService],
    exports: [StudyRoomsService, RoomSharesService, MongooseModule],
})
export class StudyRoomsModule {}