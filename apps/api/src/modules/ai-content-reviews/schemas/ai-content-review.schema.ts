import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiContentReviewDocument = HydratedDocument<AiContentReview>;
export type AiContentReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AiContentReviewType = "SUMMARY" | "QUIZ";

/**
 * Revisão docente de conteúdo gerado por IA.
 */
@Schema({ timestamps: true, collection: "ai_content_reviews" })
export class AiContentReview {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "OfficialMaterial", required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SUMMARY", "QUIZ"] })
    contentType!: AiContentReviewType;

    @Prop({ type: Object, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ required: true, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" })
    status!: AiContentReviewStatus;

    @Prop({ trim: true, maxlength: 1000 })
    teacherComment?: string;
}

export const AiContentReviewSchema =
    SchemaFactory.createForClass(AiContentReview);
AiContentReviewSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
