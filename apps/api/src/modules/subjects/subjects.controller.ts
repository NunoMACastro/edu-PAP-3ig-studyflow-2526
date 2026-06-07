import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateSubjectDto } from "./dto/create-subject.dto.js";
import { SubjectsService } from "./subjects.service.js";

/**
 * Controller das disciplinas oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) {}

    @Post("teacher/classes/:classId/subjects")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateSubjectDto,
    ) {
        return this.subjectsService.createSubject(request.user!, classId, body);
    }

    @Get("teacher/classes/:classId/subjects")
    list(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.subjectsService.listTeacherClassSubjects(request.user!, classId);
    }

    @Get("student/classes/:classId/subjects")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.subjectsService.listStudentClassSubjects(request.user!, classId);
    }
}
