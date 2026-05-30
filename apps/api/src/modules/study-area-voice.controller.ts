import { Body, Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { UpdateStudyAreaVoiceDto } from "./dto/update-study-area-voice.dto";
import { StudyAreaVoiceService } from "./study-area-voice.service";

@Controller("api/study-areas/:id/voice")
@UseGuards(SessionGuard)
export class StudyAreaVoiceController {
    constructor(private readonly voiceService: StudyAreaVoiceService) {}

    @Patch()
    updateVoice(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateStudyAreaVoiceDto,
    ) {
        return this.voiceService.updateVoice(request.user!.id, id, body);
    }
}