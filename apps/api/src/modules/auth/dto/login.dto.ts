import { IsEmail, IsString } from "class-validator";

/**
 * Dados aceites no login local por email/password.
 */
export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}
