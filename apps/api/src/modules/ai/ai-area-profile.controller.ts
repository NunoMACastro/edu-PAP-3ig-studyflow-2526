import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { AiAreaProfileService } from "./ai-area-profile.service";

@Controller("api/study-areas/:id/ai-profile")
@UseGuards(SessionGuard)
export class AiAreaProfileController {
    constructor(private readonly profileService: AiAreaProfileService) {}

    @Post()
    prepare(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.profileService.prepareProfile(request.user!.id, id);
    }
}