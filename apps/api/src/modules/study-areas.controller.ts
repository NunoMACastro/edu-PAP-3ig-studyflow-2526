import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { CreateStudyAreaDto } from "./dto/create-study-area.dto";
import { UpdateStudyAreaDto } from "./dto/update-study-area.dto";
import { StudyAreasService } from "./study-areas.service";

@Controller("api/study-areas")
@UseGuards(SessionGuard)
export class StudyAreasController {
    constructor(private readonly studyAreasService: StudyAreasService) {}

    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.studyAreasService.listMyStudyAreas(request.user!.id);
    }

    @Post()
    create(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateStudyAreaDto,
    ) {
        return this.studyAreasService.createStudyArea(request.user!.id, body);
    }

    @Get(":id")
    detail(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.studyAreasService.getMyStudyArea(request.user!.id, id);
    }

    @Patch(":id")
    update(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: UpdateStudyAreaDto,
    ) {
        return this.studyAreasService.updateStudyArea(
            request.user!.id,
            id,
            body,
        );
    }
}