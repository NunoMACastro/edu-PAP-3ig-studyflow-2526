// apps/api/src/modules/private-area-ai/private-area-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { CreatePrivateAreaAiAnswerDto } from "./dto/private-area-ai-answer.dto";
import { PrivateAreaAiService } from "./private-area-ai.service";

@UseGuards(SessionGuard)
@Controller("api/study-areas/:studyAreaId/private-ai/answers")
export class PrivateAreaAiController {
    constructor(private readonly privateAiService: PrivateAreaAiService) {}

    @Post()
    ask(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string, @Body() dto: CreatePrivateAreaAiAnswerDto) {
        return this.privateAiService.ask(actor, studyAreaId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("studyAreaId") studyAreaId: string) {
        return this.privateAiService.list(actor, studyAreaId);
    }
}