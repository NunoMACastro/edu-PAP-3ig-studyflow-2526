import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { HistoryService } from "./history.service.js";

/**
 * Controller do histórico de estudo do aluno.
 */
@Controller("api/study/history")
@UseGuards(SessionGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    /**
     * Lista os eventos do aluno autenticado.
     *
     * @param request Pedido autenticado.
     * @returns Eventos recentes de estudo.
     */
    @Get()
    list(@Req() request: AuthenticatedRequest) {
        return this.historyService.listMyEvents(request.user!.id);
    }
}
