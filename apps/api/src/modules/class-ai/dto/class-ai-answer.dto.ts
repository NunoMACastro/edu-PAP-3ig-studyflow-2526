// apps/api/src/modules/class-ai/dto/class-ai-answer.dto.ts
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassAiAnswerDto {
    @IsString()
    @MinLength(3)
    @MaxLength(4000)
    question!: string;
}