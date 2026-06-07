import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { ClassAiService } from "./class-ai.service.js";
import { AskClassAiDto } from "./dto/ask-class-ai.dto.js";

/**
 * Controller da IA limitada da disciplina.
 */
@Controller("api/student/subjects/:subjectId/ai/answers")
@UseGuards(SessionGuard)
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: AskClassAiDto,
    ) {
        return this.classAiService.askClassAi(request.user!, subjectId, body);
    }
}
