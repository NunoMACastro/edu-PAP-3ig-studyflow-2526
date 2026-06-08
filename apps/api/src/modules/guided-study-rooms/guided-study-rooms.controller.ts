// apps/api/src/modules/guided-study-rooms/guided-study-rooms.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreateGuidedStudyRoomDto } from "./dto/guided-study-room.dto";
import { GuidedStudyRoomsService } from "./guided-study-rooms.service";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/guided-study-rooms")
export class GuidedStudyRoomsTeacherController {
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    @Post()
    create(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateGuidedStudyRoomDto) {
        return this.roomsService.create(actor, classId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.roomsService.listForTeacher(actor, classId);
    }
}

@UseGuards(SessionGuard)
@Controller("api/student/classes/:classId/guided-study-rooms")
export class GuidedStudyRoomsStudentController {
    constructor(private readonly roomsService: GuidedStudyRoomsService) {}

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.roomsService.listForStudent(actor, classId);
    }
}

