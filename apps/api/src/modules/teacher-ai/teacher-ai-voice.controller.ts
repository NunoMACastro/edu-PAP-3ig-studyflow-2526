import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateTeacherAiVoiceDto } from "./dto/update-teacher-ai-voice.dto.js";
import { TeacherAiVoiceService } from "./teacher-ai-voice.service.js";

/**
 * Controller da voz textual da IA docente.
 */
@Controller("api/teacher/subjects/:subjectId/ai-voice")
@UseGuards(SessionGuard)
export class TeacherAiVoiceController {
    constructor(private readonly voiceService: TeacherAiVoiceService) {}

    @Put()
    update(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: UpdateTeacherAiVoiceDto,
    ) {
        return this.voiceService.updateTeacherVoice(request.user!, subjectId, body);
    }

    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        return this.voiceService.getTeacherVoice(request.user!, subjectId);
    }
}
