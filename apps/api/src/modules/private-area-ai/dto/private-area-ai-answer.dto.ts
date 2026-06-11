
// apps/api/src/modules/private-area-ai/dto/private-area-ai-answer.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreatePrivateAreaAiAnswerDto {
    @IsString()
    @MinLength(3)
    @MaxLength(4000)
    question!: string;
}