import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";

/**
 * Dados para criar uma rotina pessoal de estudo.
 */
export class CreateRoutineDto {
    @IsString()
    @MaxLength(120)
    title!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    weekdays!: string[];

    @IsString()
    @MaxLength(5)
    startTime!: string;

    @IsInt()
    @Min(5)
    @Max(480)
    durationMinutes!: number;
}

/**
 * Campos editáveis de uma rotina pessoal de estudo.
 */
export class UpdateRoutineDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    title?: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    weekdays?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(5)
    startTime?: string;

    @IsOptional()
    @IsInt()
    @Min(5)
    @Max(480)
    durationMinutes?: number;
}
