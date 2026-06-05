// apps/api/src/modules/teacher-ai/dto/update-teacher-ai-voice.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTeacherAiVoiceDto {
    @IsIn(["CALM", "DIRECT", "SOCRATIC"])
    tone!: "CALM" | "DIRECT" | "SOCRATIC";

    @IsIn(["SHORT", "BALANCED", "DETAILED"])
    detailLevel!: "SHORT" | "BALANCED" | "DETAILED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(180, { each: true })
    rules?: string[];
}