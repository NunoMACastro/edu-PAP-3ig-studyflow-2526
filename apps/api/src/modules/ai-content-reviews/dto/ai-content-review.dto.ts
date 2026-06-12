import { IsIn, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import {
    AiContentReviewStatus,
    AiContentReviewType,
} from "../schemas/ai-content-review.schema.js";

/**
 * Dados para criar revisão docente pendente.
 */
export class CreateAiContentReviewDto {
    @IsString()
    materialId!: string;

    @IsIn(["SUMMARY", "QUIZ"])
    contentType!: AiContentReviewType;

    @IsObject()
    contentJson!: Record<string, unknown>;
}

/**
 * Decisão docente sobre conteúdo IA.
 */
export class DecideAiContentReviewDto {
    @IsIn(["APPROVED", "REJECTED"])
    status!: Exclude<AiContentReviewStatus, "PENDING">;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    teacherComment?: string;
}
