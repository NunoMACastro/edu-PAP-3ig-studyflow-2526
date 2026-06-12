import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Dados de criação de disciplina oficial.
 */
export class CreateSubjectDto {
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(40)
    code!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
