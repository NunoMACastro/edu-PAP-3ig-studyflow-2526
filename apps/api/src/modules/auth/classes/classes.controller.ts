// apps/api/src/modules/classes/classes.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../../common/types/authenticated-request";
import { SessionGuard } from "../../../common/guards/session.guard";
import { ClassesService } from "./classes.service";
import { AddClassStudentDto } from "../dto/add-class-student.dto";
import { CreateClassDto } from "../dto/create-class.dto";

@Controller("api")
@UseGuards(SessionGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) {}

    @Post("teacher/classes")
    create(@Req() request: AuthenticatedRequest, @Body() dto: CreateClassDto) {
        return this.classesService.create(request.user as AuthenticatedUser, dto);
    }

    @Get("teacher/classes")
    listForTeacher(@Req() request: AuthenticatedRequest) {
        return this.classesService.listForTeacher(request.user as AuthenticatedUser);
    }

    @Post("teacher/classes/:classId/students")
    addStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: AddClassStudentDto,
    ) {
        return this.classesService.addStudent(request.user as AuthenticatedUser, classId, dto);
    }

    @Get("student/classes")
    listForStudent(@Req() request: AuthenticatedRequest) {
        return this.classesService.listForStudent(request.user as AuthenticatedUser);
    }
}