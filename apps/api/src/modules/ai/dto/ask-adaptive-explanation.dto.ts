// apps/api/src/modules/ai/dto/ask-adaptive-explanation.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class AskAdaptiveExplanationDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    topic!: string;
}