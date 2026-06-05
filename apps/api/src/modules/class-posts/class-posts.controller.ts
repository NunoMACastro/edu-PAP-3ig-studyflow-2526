// apps/api/src/modules/class-posts/class-posts.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassPostsService } from "./class-posts.service";
import { CreateClassPostDto } from "./dto/create-class-post.dto";

@Controller("api")
@UseGuards(SessionGuard)
export class ClassPostsController {
    constructor(private readonly classPostsService: ClassPostsService) {}

    @Post("teacher/classes/:classId/posts")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() dto: CreateClassPostDto,
    ) {
        return this.classPostsService.create(request.user as AuthenticatedUser, classId, dto);
    }

    @Get("teacher/classes/:classId/posts")
    listForTeacher(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForTeacher(request.user as AuthenticatedUser, classId);
    }

    @Get("student/classes/:classId/posts")
    listForStudent(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.classPostsService.listForStudent(request.user as AuthenticatedUser, classId);
    }
}