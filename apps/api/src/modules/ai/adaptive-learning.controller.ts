import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AdaptiveLearningService } from "./adaptive-learning.service.js";
import { AskAdaptiveExplanationDto } from "./dto/ask-adaptive-explanation.dto.js";
import { UpdateLearningProfileDto } from "./dto/update-learning-profile.dto.js";

/**
 * Controller do BK-MF1-01 para aprendizagem adaptativa.
 */
@Controller("api/study-areas/:studyAreaId")
@UseGuards(SessionGuard)
export class AdaptiveLearningController {
    constructor(private readonly adaptiveLearningService: AdaptiveLearningService) {}

    @Get("learning-profile")
    getProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
    ) {
        return this.adaptiveLearningService.getLearningProfile(
            request.user!.id,
            studyAreaId,
        );
    }

    @Put("learning-profile")
    updateProfile(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: UpdateLearningProfileDto,
    ) {
        return this.adaptiveLearningService.updateLearningProfile(
            request.user!.id,
            studyAreaId,
            body,
        );
    }

    @Post("adaptive-explanations")
    ask(
        @Req() request: AuthenticatedRequest,
        @Param("studyAreaId") studyAreaId: string,
        @Body() body: AskAdaptiveExplanationDto,
    ) {
        return this.adaptiveLearningService.askAdaptiveExplanation(
            request.user!.id,
            studyAreaId,
            body,
        );
    }
}
