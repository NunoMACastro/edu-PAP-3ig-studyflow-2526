import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { SummariesService } from "./summaries.service";

@Controller("api/study-areas/:id/summaries")
@UseGuards(SessionGuard)
export class SummariesController {
    constructor(private readonly summariesService: SummariesService) {}

    @Post()
    generate(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.summariesService.generateSummary(request.user!.id, id);
    }
}