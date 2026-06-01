import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { CreateStudyToolDto, StudyToolType } from "./dto/create-study-tool.dto.js";
import { StudyToolsService } from "./study-tools.service.js";

/**
 * Controller de ferramentas de estudo geradas por IA.
 */
@Controller("api/study-areas/:id/study-tools")
@UseGuards(SessionGuard)
export class StudyToolsController {
    constructor(private readonly studyToolsService: StudyToolsService) {}

    /**
     * Lista ferramentas já geradas para a área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param type Tipo opcional para filtrar.
     * @returns Artefactos IA da área.
     */
    @Get()
    list(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Query("type") type?: StudyToolType,
    ) {
        return this.studyToolsService.listTools(request.user!.id, id, type);
    }

    /**
     * Gera uma explicação, flashcards ou quiz.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @param body Pedido de geração.
     * @returns Artefacto criado.
     */
    @Post()
    generate(
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() body: CreateStudyToolDto,
    ) {
        return this.studyToolsService.generateStudyTool(
            request.user!.id,
            id,
            body,
        );
    }
}
