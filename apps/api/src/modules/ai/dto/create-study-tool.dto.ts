import { Allow, IsOptional, IsString, MaxLength } from "class-validator";

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const STUDY_TOOL_TYPES: StudyToolType[] = [
    "EXPLANATION",
    "FLASHCARDS",
    "QUIZ",
];

/**
 * Pedido de geração de explicação, flashcards ou quiz.
 *
 * O tópico é opcional e apenas restringe foco. Nunca substitui fontes
 * processáveis, porque a MF0 exige respostas baseadas nos materiais enviados.
 */
export class CreateStudyToolDto {
    @Allow()
    type!: StudyToolType;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}
