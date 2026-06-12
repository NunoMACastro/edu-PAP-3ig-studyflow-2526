import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateClassProgressNoteDto } from "./dto/class-progress-note.dto.js";
import { ClassProgressService } from "./class-progress.service.js";

/**
 * Endpoint de painel docente de progresso da turma.
 */
@Controller("api/teacher/classes/:classId/progress")
@UseGuards(SessionGuard)
export class ClassProgressController {
    constructor(private readonly progressService: ClassProgressService) {}

    @Get()
    get(@Req() request: AuthenticatedRequest, @Param("classId") classId: string) {
        return this.progressService.getClassProgress(request.user!, classId);
    }

    @Post("notes")
    createNote(
        @Req() request: AuthenticatedRequest,
        @Param("classId") classId: string,
        @Body() input: CreateClassProgressNoteDto,
    ) {
        return this.progressService.createNote(request.user!, classId, input);
    }
}
