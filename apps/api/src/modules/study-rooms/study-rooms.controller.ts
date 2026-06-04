// apps/api/src/modules/study-rooms/study-rooms.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request.js";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AddRoomMemberDto } from "./dto/add-room-member.dto.js";
import { CreateStudyRoomDto } from "./dto/create-study-room.dto.js";
import { StudyRoomsService } from "./study-rooms.service.js";

@Controller("api/study-rooms")
@UseGuards(SessionGuard)
export class StudyRoomsController {
    constructor(private readonly studyRoomsService: StudyRoomsService) {}

    @Post()
    create(@Req() request: AuthenticatedRequest, @Body() dto: CreateStudyRoomDto) {
        return this.studyRoomsService.create(request.user as AuthenticatedUser, dto);
    }

    @Get()
    listMine(@Req() request: AuthenticatedRequest) {
        return this.studyRoomsService.listMine(request.user as AuthenticatedUser);
    }

    @Post(":roomId/members")
    addMember(
        @Req() request: AuthenticatedRequest,
        @Param("roomId") roomId: string,
        @Body() dto: AddRoomMemberDto,
    ) {
        return this.studyRoomsService.addMember(request.user as AuthenticatedUser, roomId, dto);
    }
}