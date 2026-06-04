// apps/api/src/modules/ai/dto/update-learning-profile.dto.ts
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateLearningProfileDto {
    @IsIn(["SLOW", "BALANCED", "FAST"])
    pace!: "SLOW" | "BALANCED" | "FAST";

    @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    level!: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    difficulties?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(200)
    preferredExplanationStyle?: string;
}