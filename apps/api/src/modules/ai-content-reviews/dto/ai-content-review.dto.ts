export type AiContentKind = "SUMMARY" | "QUIZ";
export type AiContentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export class CreateAiContentReviewDto {
    materialId!: string;
    kind!: AiContentKind;
    generatedContent!: string;
}

export class DecideAiContentReviewDto {
    status!: "APPROVED" | "REJECTED";
    rejectionReason?: string | null;
}

export { CreateAiContentReviewDto as CreateDto, DecideAiContentReviewDto as DecideDto };
