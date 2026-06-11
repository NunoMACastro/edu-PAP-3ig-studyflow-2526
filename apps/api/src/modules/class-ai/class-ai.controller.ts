// apps/api/src/modules/class-ai/class-ai.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassAiService } from "./class-ai.service";
import { CreateClassAiAnswerDto } from "./dto/class-ai-answer.dto";

@UseGuards(SessionGuard)
@Controller("api/student/subjects/:subjectId/ai/answers")
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    ask(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string, @Body() dto: CreateClassAiAnswerDto) {
        return this.classAiService.ask(actor, subjectId, dto);
    }

    @Get()
    list(@CurrentUser() actor: AuthenticatedUser, @Param("subjectId") subjectId: string) {
        return this.classAiService.list(actor, subjectId);
    }
}