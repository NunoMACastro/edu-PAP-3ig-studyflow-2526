import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassPostsService } from "./class-posts.service.js";
import { CreateClassPostDto } from "./dto/create-class-post.dto.js";

/**
 * Controller de publicações por turma.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class ClassPostsController {
    constructor(private readonly classPostsService: ClassPostsService) {}

    @Post("teacher/classes/:classId/posts")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() body: CreateClassPostDto,
    ) {
        return this.classPostsService.createPost(request.user!, classId, body);
    }

    @Get("teacher/classes/:classId/posts")
    listTeacher(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.classPostsService.listTeacherPosts(request.user!, classId);
    }

    @Get("student/classes/:classId/posts")
    listStudent(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
    ) {
        return this.classPostsService.listStudentPosts(request.user!, classId);
    }
}
