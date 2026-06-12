import { IsEmail } from "class-validator";

/**
 * Dados para associar aluno existente à turma.
 */
export class AddClassStudentDto {
    @IsEmail()
    email!: string;
}
