import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AskPrivateAreaAiDto } from "./dto/ask-private-area-ai.dto.js";
import { PrivateAreaAiService } from "./private-area-ai.service.js";

/**
 * Endpoint do assistente IA privado por área.
 */
@Controller("api/student/study-areas/:studyAreaId/private-ai/answers")
@UseGuards(SessionGuard)
export class PrivateAreaAiController {
    constructor(private readonly privateAreaAiService: PrivateAreaAiService) {}

    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: AskPrivateAreaAiDto,
    ) {
        return this.privateAreaAiService.ask(request.user!, studyAreaId, body);
    }
}
