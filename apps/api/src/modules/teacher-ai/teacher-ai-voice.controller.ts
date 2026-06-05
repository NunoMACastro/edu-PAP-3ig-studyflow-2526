// apps/api/src/modules/teacher-ai/teacher-ai-voice.controller.ts
import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service";

@Controller("api/teacher/subjects/:subjectId/ai-voice")
@UseGuards(SessionGuard)
export class TeacherAiVoiceController {
    constructor(private readonly teacherAiVoiceService: TeacherAiVoiceService) {}

    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: UpdateTeacherAiVoiceDto,
    ) {
        return this.teacherAiVoiceService.upsert(
            request.user as AuthenticatedUser,
            subjectId,
            dto,
        );
    }

    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.teacherAiVoiceService.getForTeacher(
            request.user as AuthenticatedUser,
            subjectId,
        );
    }
}