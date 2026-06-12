import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateGuidedStudyRoomDto } from "./dto/create-guided-study-room.dto.js";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service.js";

/**
 * Endpoints de salas guiadas para professores e alunos.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class GuidedStudyRoomsController {
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    @Post("teacher/classes/:classId/guided-study-rooms")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateGuidedStudyRoomDto,
    ) {
        return this.roomsService.create(request.user!, classId, body);
    }

    @Get("teacher/classes/:classId/guided-study-rooms")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.roomsService.listForTeacher(request.user!, classId);
    }

    @Get("student/classes/:classId/guided-study-rooms")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.roomsService.listForStudent(request.user!, classId);
    }
}
