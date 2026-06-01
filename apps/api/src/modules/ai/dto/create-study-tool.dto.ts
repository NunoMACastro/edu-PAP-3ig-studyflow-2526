import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

export const STUDY_TOOL_TYPES: StudyToolType[] = [
    "EXPLANATION",
    "FLASHCARDS",
    "QUIZ",
];

export class CreateStudyToolDto {
    @IsIn(STUDY_TOOL_TYPES)
    type!: StudyToolType;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}