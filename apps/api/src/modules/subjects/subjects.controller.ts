// apps/api/src/modules/subjects/subjects.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request.js";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { CreateSubjectDto } from "../materials/dto/create-subject.dto.js";
import { SubjectsService } from "./subjects.service.js";

@Controller("api/teacher/classes/:classId/subjects")
@UseGuards(SessionGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) {}

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateSubjectDto,
    ) {
        return this.subjectsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.subjectsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }
}