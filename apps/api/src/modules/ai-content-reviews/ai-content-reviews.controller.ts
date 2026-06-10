// apps/api/src/modules/ai-content-reviews/ai-content-reviews.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { AiContentReviewsService } from "./ai-content-reviews.service.js";
import { CreateAiContentReviewDto, DecideAiContentReviewDto } from "./dto/ai-content-review.dto.js";

@UseGuards(SessionGuard)
@Controller("api/teacher/subjects/:subjectId/ai-content-reviews")
export class AiContentReviewsController {
    constructor(private readonly reviewsService: AiContentReviewsService) {}

    @Post()
    create(@Req() req: AuthenticatedRequest, @Param("subjectId") subjectId: string, @Body() dto: CreateAiContentReviewDto) {
        const actor = req.user!;
        return this.reviewsService.create(actor, subjectId, dto);
    }

    @Get()
    list(@Req() req: AuthenticatedRequest, @Param("subjectId") subjectId: string) {
        const actor = req.user!;
        return this.reviewsService.list(actor, subjectId);
    }

    @Patch(":reviewId/decision")
    decide(@Req() req: AuthenticatedRequest, @Param("subjectId") subjectId: string, @Param("reviewId") reviewId: string, @Body() dto: DecideAiContentReviewDto) {
        const actor = req.user!;
        return this.reviewsService.decide(actor, subjectId, reviewId, dto);
    }
}