import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import { PublicUserDto, UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterStudentDto } from "./dto/register-student.dto.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 10;

/**
 * Serviço de autenticação local.
 *
 * Implementa BK-MF0-01 e BK-MF0-02: registo de aluno, hashing de password e
 * validação de credenciais para criação posterior da sessão.
 */
@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    /**
     * Regista um aluno com email/password.
     *
     * @param input DTO de registo vindo do controller.
     * @returns Utilizador público sem `passwordHash`.
     * @throws BadRequestException quando email/password não cumprem o contrato.
     * @throws ConflictException quando o email já existe.
     */
    async registerStudent(input: RegisterStudentDto): Promise<PublicUserDto> {
        const email = this.normalizeAndValidateEmail(input.email);
        this.validatePasswordPair(input.password, input.confirmPassword);

        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException({
                code: "EMAIL_ALREADY_REGISTERED",
                message: "Já existe uma conta com este email.",
            });
        }

        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await this.usersService.createStudent(email, passwordHash);
        return this.usersService.toPublicUser(user);
    }

    /**
     * Valida credenciais locais para login.
     *
     * @param input DTO de login com email e password.
     * @returns Utilizador público autenticado.
     * @throws UnauthorizedException com mensagem genérica em falha de login.
     */
    async validateLogin(input: LoginDto): Promise<PublicUserDto> {
        const email = this.normalizeAndValidateEmail(input.email);
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw this.invalidCredentials();
        }

        const passwordMatches = await bcrypt.compare(
            input.password,
            user.passwordHash,
        );
        if (!passwordMatches) {
            throw this.invalidCredentials();
        }

        return this.usersService.toPublicUser(user);
    }

    /**
     * Normaliza e valida o email.
     *
     * @param email Valor recebido do frontend.
     * @returns Email em minúsculas e sem espaços laterais.
     * @throws BadRequestException quando o email é inválido.
     */
    private normalizeAndValidateEmail(email: string): string {
        const normalized = String(email ?? "").trim().toLowerCase();
        if (!EMAIL_PATTERN.test(normalized)) {
            throw new BadRequestException({
                code: "INVALID_EMAIL",
                message: "Indica um email válido.",
            });
        }
        return normalized;
    }

    /**
     * Valida força mínima e confirmação da password.
     *
     * @param password Password principal recebida do aluno.
     * @param confirmPassword Confirmação enviada pelo formulário.
     * @returns Nada quando a password é aceite.
     * @throws BadRequestException quando a password é fraca ou diferente.
     */
    private validatePasswordPair(
        password: string,
        confirmPassword: string,
    ): void {
        if (String(password ?? "").length < MIN_PASSWORD_LENGTH) {
            throw new BadRequestException({
                code: "WEAK_PASSWORD",
                message: "A password deve ter pelo menos 10 caracteres.",
            });
        }

        if (password !== confirmPassword) {
            throw new BadRequestException({
                code: "PASSWORD_CONFIRMATION_MISMATCH",
                message: "A confirmação da password não coincide.",
            });
        }
    }

    /**
     * Cria um erro de credenciais inválidas sem revelar qual campo falhou.
     *
     * @returns Exceção pronta a lançar.
     */
    private invalidCredentials(): UnauthorizedException {
        return new UnauthorizedException({
            code: "INVALID_CREDENTIALS",
            message: "Email ou password inválidos.",
        });
    }
}
