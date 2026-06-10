import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAiContentReviewDto {
    @IsMongoId()
    materialId!: string;

    @IsEnum(["SUMMARY", "QUIZ"])
    kind!: "SUMMARY" | "QUIZ";

    @IsString()
    @MinLength(20)
    @MaxLength(20000)
    generatedContent!: string;
}

export class DecideAiContentReviewDto {
    @IsEnum(["APPROVED", "REJECTED"])
    status!: "APPROVED" | "REJECTED";

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    rejectionReason?: string;
}
