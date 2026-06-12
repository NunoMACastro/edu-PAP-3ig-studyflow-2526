import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AddRoomMemberDto } from "./dto/add-room-member.dto.js";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto.js";
import { StudyRoomsService } from "./study-rooms.service.js";

/**
 * Controller das salas de estudo.
 */
@Controller("api/study-rooms")
@UseGuards(SessionGuard)
export class StudyRoomsController {
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateStudyRoomDto) {
        return this.studyRoomsService.createRoom(request.user!, body);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyRoomsService.listMyRooms(request.user!);
    }

    @Post(":roomId/members")
    addMember(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() body: AddRoomMemberDto,
    ) {
        return this.studyRoomsService.addMember(request.user!, roomId, body);
    }
}
