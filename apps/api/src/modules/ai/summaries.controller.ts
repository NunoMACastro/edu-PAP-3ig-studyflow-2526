import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { SummariesService } from "./summaries.service.js";

/**
 * Controller de resumos IA por área.
 */
@Controller("api/study-areas/:id/summaries")
@UseGuards(SessionGuard)
export class SummariesController {
    constructor(private readonly summariesService: SummariesService) {}

    /**
     * Gera um resumo baseado nas fontes prontas da área.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @returns Artefacto de resumo criado.
     */
    @Post()
    generate(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.summariesService.generateSummary(request.user!.id, id);
    }

    /**
     * Lista os resumos já gerados para a área autenticada.
     *
     * @param request Pedido autenticado.
     * @param id Identificador da área.
     * @returns Artefactos `SUMMARY` da área.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
        return this.summariesService.listSummaries(request.user!.id, id);
    }
}
