// apps/api/src/modules/class-progress/class-progress.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SessionGuard } from "../../common/guards/session.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-request";
import { ClassProgressService } from "./class-progress.service";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto";

@UseGuards(SessionGuard)
@Controller("api/teacher/classes/:classId/progress-dashboard")
export class ClassProgressController {
    constructor(private readonly progressService: ClassProgressService) {}

    @Post("notes")
    createNote(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string, @Body() dto: CreateClassProgressNoteDto) {
        return this.progressService.createNote(actor, classId, dto);
    }

    @Get()
    dashboard(@CurrentUser() actor: AuthenticatedUser, @Param("classId") classId: string) {
        return this.progressService.dashboard(actor, classId);
    }
}