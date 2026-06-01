import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    ValidationPipe,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";

/**
 * Teste unitário mínimo previsto pelo BK-MF0-01.
 *
 * Mantém o caso crítico: email duplicado não pode criar nova conta. O teste
 * usa mocks diretos para não depender de MongoDB durante a validação unitária.
 */
describe("AuthService", () => {
    /**
     * Confirma que o service rejeita duplicados antes de tentar criar conta.
     */
    it("rejeita email duplicado no registo", async () => {
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue({ id: "existing" }),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const service = new AuthService(usersService as never);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "password-segura",
                confirmPassword: "password-segura",
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    /**
     * Confirma que passwords fracas são rejeitadas antes de persistir.
     */
    it("rejeita password fraca no registo", async () => {
        const usersService = {
            findByEmail: jest.fn(),
            createStudent: jest.fn(),
            toPublicUser: jest.fn(),
        };
        const service = new AuthService(usersService as never);

        await expect(
            service.registerStudent({
                email: "aluno@example.com",
                password: "curta",
                confirmPassword: "curta",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(usersService.findByEmail).not.toHaveBeenCalled();
        expect(usersService.createStudent).not.toHaveBeenCalled();
    });

    /**
     * Confirma que o login falha com mensagem genérica.
     */
    it("rejeita credenciais inválidas sem revelar o campo errado", async () => {
        const passwordHash = await bcrypt.hash("password-correta", 4);
        const usersService = {
            findByEmail: jest.fn().mockResolvedValue({
                email: "aluno@example.com",
                passwordHash,
            }),
            toPublicUser: jest.fn(),
        };
        const service = new AuthService(usersService as never);

        await expect(
            service.validateLogin({
                email: "aluno@example.com",
                password: "password-errada",
            }),
        ).rejects.toMatchObject({
            response: {
                code: "INVALID_CREDENTIALS",
                message: "Email ou password inválidos.",
            },
        });
        await expect(
            service.validateLogin({
                email: "aluno@example.com",
                password: "password-errada",
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    /**
     * Confirma que campos fora do DTO público são bloqueados pelo pipe global.
     */
    it("rejeita campos extra no DTO de registo", async () => {
        const pipe = new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        await expect(
            pipe.transform(
                {
                    email: "aluno@example.com",
                    password: "password-segura",
                    confirmPassword: "password-segura",
                    role: "ADMIN",
                    passwordHash: "hash-forjado",
                },
                {
                    type: "body",
                    metatype: RegisterStudentDto,
                },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
