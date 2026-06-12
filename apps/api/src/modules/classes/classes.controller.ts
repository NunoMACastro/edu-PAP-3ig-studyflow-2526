import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassesService } from "./classes.service.js";
import { AddClassStudentDto } from "./dto/add-class-student.dto.js";
import { CreateClassDto } from "./dto/create-class.dto.js";

/**
 * Controller de turmas oficiais.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassesController {
    constructor(private readonly classesService: ClassesService) {}

    @Post("teacher/classes")
    create(@Req() request: AuthenticatedRequest, @Body() body: CreateClassDto) {
        return this.classesService.createClass(request.user!, body);
    }

    @Get("teacher/classes")
    listTeacher(@Req() request: AuthenticatedRequest) {
        return this.classesService.listTeacherClasses(request.user!);
    }

    @Post("teacher/classes/:classId/students")
    addStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: AddClassStudentDto,
    ) {
        return this.classesService.addStudent(request.user!, classId, body);
    }

    @Get("student/classes")
    listStudent(@Req() request: AuthenticatedRequest) {
        return this.classesService.listStudentClasses(request.user!);
    }
}
