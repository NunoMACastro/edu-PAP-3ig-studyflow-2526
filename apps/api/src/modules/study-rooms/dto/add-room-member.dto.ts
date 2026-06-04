// apps/api/src/modules/study-rooms/dto/add-room-member.dto.ts
import { IsEmail } from "class-validator";

export class AddRoomMemberDto {
    @IsEmail()
    email!: string;
}