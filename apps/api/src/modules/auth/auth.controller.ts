import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { SessionGuard } from "../../common/guards/session.guard.js";
import { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";
import {
    SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS,
    SessionService,
} from "./session.service.js";
import { AuthService } from "./auth.service.js";

/**
 * Controller de autenticação da MF0.
 *
 * Expõe os endpoints derivados dos BKs: registo, login, logout e consulta da
 * sessão atual. O cookie de sessão é HttpOnly e não há tokens em localStorage.
 */
@Controller("api/auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
    ) {}

    /**
     * Cria uma conta local de aluno.
     *
     * @param body Dados do formulário de registo.
     * @returns Utilizador público recém-criado.
     */
    @Post("register")
    register(@Body() body: RegisterStudentDto) {
        return this.authService.registerStudent(body);
    }

    /**
     * Valida credenciais e define o cookie HttpOnly.
     *
     * @param body Credenciais locais.
     * @param response Resposta Express usada para configurar o cookie.
     * @returns Utilizador público autenticado.
     */
    @Post("login")
    @HttpCode(200)
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
        const user = await this.authService.validateLogin(body);
        const sessionId = await this.sessionService.createSession(user);
        this.setSessionCookie(response, sessionId);
        return user;
    }

    /**
     * Devolve a sessão atual já validada pelo guard.
     *
     * @param request Pedido autenticado.
     * @returns Utilizador da sessão.
     */
    @Get("me")
    @UseGuards(SessionGuard)
    me(@Req() request: AuthenticatedRequest) {
        return request.user;
    }

    /**
     * Invalida a sessão atual e limpa o cookie no browser.
     *
     * @param request Pedido que pode conter o cookie de sessão.
     * @param response Resposta Express usada para limpar o cookie.
     * @returns Estado simples de sucesso.
     */
    @Post("logout")
    @HttpCode(200)
    async logout(
        @Req() request: AuthenticatedRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
        if (sessionId) {
            await this.sessionService.destroySession(sessionId);
        }

        response.clearCookie(SESSION_COOKIE_NAME, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return { ok: true };
    }

    /**
     * Aplica o cookie de sessão com flags seguras.
     *
     * @param response Resposta Express.
     * @param sessionId Identificador opaco da sessão.
     * @returns Nada; apenas modifica os headers da resposta.
     */
    private setSessionCookie(response: Response, sessionId: string): void {
        response.cookie(SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: SESSION_TTL_SECONDS * 1000,
            path: "/",
        });
    }
}
