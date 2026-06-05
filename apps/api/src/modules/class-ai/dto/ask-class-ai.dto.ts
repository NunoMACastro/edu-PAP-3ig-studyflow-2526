// apps/api/src/modules/class-ai/dto/ask-class-ai.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskClassAiDto {
    @IsString()
    @MinLength(10)
    @MaxLength(800)
    question!: string;
}