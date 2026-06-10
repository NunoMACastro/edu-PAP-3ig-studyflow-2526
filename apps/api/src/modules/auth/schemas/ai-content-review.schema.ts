// apps/api/src/modules/ai-content-reviews/schemas/ai-content-review.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiContentReviewDocument = HydratedDocument<AiContentReview>;
export type AiContentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

@Schema({ timestamps: true, collection: "ai_content_reviews" })
export class AiContentReview {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SUMMARY", "QUIZ"] })
    kind!: "SUMMARY" | "QUIZ";

    @Prop({ required: true, trim: true, minlength: 20, maxlength: 20000 })
    generatedContent!: string;

    @Prop({ required: true, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" })
    status!: AiContentReviewStatus;

    @Prop({ trim: true, maxlength: 2000 })
    rejectionReason?: string;
}

export const AiContentReviewSchema = SchemaFactory.createForClass(AiContentReview);
AiContentReviewSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
