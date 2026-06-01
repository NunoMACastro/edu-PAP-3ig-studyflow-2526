import { IsEmail, IsString, MinLength } from "class-validator";

/**
 * Dados aceites no registo público de aluno.
 *
 * Apenas estes campos entram no BK-MF0-01. Campos como `role`, `id` ou
 * `authProvider` nunca devem vir do frontend no registo público.
 */
export class RegisterStudentDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(10)
    password!: string;

    @IsString()
    @MinLength(10)
    confirmPassword!: string;
}
