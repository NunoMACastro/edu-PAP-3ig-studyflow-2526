// apps/api/src/modules/class-ai/class-ai.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
    AuthenticatedRequest,
    AuthenticatedUser,
} from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { ClassAiService } from "./class-ai.service";
import { AskClassAiDto } from "./dto/ask-class-ai.dto";

@Controller("api/student/subjects/:subjectId/ai/answers")
@UseGuards(SessionGuard)
export class ClassAiController {
    constructor(private readonly classAiService: ClassAiService) {}

    @Post()
    answer(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() dto: AskClassAiDto,
    ) {
        return this.classAiService.answer(request.user as AuthenticatedUser, subjectId, dto);
    }
}