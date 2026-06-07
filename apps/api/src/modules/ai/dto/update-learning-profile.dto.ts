import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Dados editáveis do perfil de aprendizagem.
 */
export class UpdateLearningProfileDto {
    @IsOptional()
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace?: "SLOW" | "BALANCED" | "FAST";

    @IsOptional()
    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsString()
    @MaxLength(600)
    difficultyNotes?: string;
}
