import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";
import {
    CreateAiContentReviewDto,
    DecideAiContentReviewDto,
} from "./dto/ai-content-review.dto.js";

/**
 * Endpoints docentes de revisão de conteúdos IA.
 */
@Controller("api")
@UseGuards(SessionGuard)
export class AiContentReviewsController {
    constructor(private readonly reviewsService: AiContentReviewsService) {}

    @Post("teacher/subjects/:subjectId/ai-content-reviews")
    create(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
        @Body() body: CreateAiContentReviewDto,
    ) {
        return this.reviewsService.create(request.user!, subjectId, body);
    }

    @Get("teacher/subjects/:subjectId/ai-content-reviews")
    list(
        @Req() request: AuthenticatedRequest,
        @Param("subjectId") subjectId: string,
    ) {
        return this.reviewsService.listForSubject(request.user!, subjectId);
    }

    @Patch("teacher/ai-content-reviews/:reviewId")
    decide(
        @Req() request: AuthenticatedRequest,
        @Param("reviewId") reviewId: string,
        @Body() body: DecideAiContentReviewDto,
    ) {
        return this.reviewsService.decide(request.user!, reviewId, body);
    }
}
