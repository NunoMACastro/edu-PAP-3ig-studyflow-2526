// apps/api/src/modules/ai/adaptive-learning.controller.ts
import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SessionGuard } from "../../common/guards/session.guard";
import { AdaptiveLearningService } from "./adaptive-learning.service";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto";

@Controller("api/study-areas/:studyAreaId")
@UseGuards(SessionGuard)
export class AdaptiveLearningController {
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    @Get("learning-profile")
    getProfile(@Req() request: AuthenticatedRequest, @Param("studyAreaId") studyAreaId: string) {
        return this.adaptiveLearningService.getProfile(request.user!.id, studyAreaId);
    }

    @Put("learning-profile")
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: UpdateLearningProfileDto,
    ) {
        return this.adaptiveLearningService.updateProfile(request.user!.id, studyAreaId, dto);
    }

    @Post("adaptive-explanations")
    explain(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() dto: AskAdaptiveExplanationDto,
    ) {
        return this.adaptiveLearningService.explain(request.user!.id, studyAreaId, dto);
    }
}