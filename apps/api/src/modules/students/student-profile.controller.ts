import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { UpdateStudentProfileDto } from "./dto/update-student-profile.dto.js";
import { StudentProfileService } from "./student-profile.service.js";

/**
 * Controller protegido para o perfil do aluno autenticado.
 */
@Controller("api/students/me/profile")
@UseGuards(SessionGuard)
export class StudentProfileController {
    constructor(private readonly profileService: StudentProfileService) {}

    /**
     * Devolve o perfil do aluno autenticado.
     *
     * @param request Pedido já enriquecido pelo `SessionGuard`.
     * @returns Perfil existente ou `null`.
     */
    @Get()
    getMyProfile(@Req() request: AuthenticatedRequest) {
        return this.profileService.getMyProfile(request.user!.id);
    }

    /**
     * Atualiza o perfil do aluno autenticado.
     *
     * @param request Pedido já enriquecido pelo `SessionGuard`.
     * @param body Campos editáveis do perfil.
     * @returns Perfil atualizado.
     */
    @Patch()
    updateMyProfile(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateStudentProfileDto,
    ) {
        return this.profileService.updateMyProfile(request.user!.id, body);
    }
}
