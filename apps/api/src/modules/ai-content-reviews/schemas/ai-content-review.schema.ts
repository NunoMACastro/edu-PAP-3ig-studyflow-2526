import { Document, Schema, Types } from "mongoose";

export type AiContentReviewDocument = AiContentReview & Document;

export class AiContentReview {
    _id!: Types.ObjectId;
    subjectId!: Types.ObjectId;
    materialId!: Types.ObjectId;
    teacherId!: Types.ObjectId;
    kind!: "SUMMARY" | "QUIZ";
    status!: "PENDING" | "APPROVED" | "REJECTED";
    generatedContent!: string;
    rejectionReason?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export const AiContentReviewSchema = new Schema(
    {
        subjectId: { type: Types.ObjectId, required: true },
        materialId: { type: Types.ObjectId, required: true },
        teacherId: { type: Types.ObjectId, required: true },
        kind: { type: String, enum: ["SUMMARY", "QUIZ"], required: true },
        status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
        generatedContent: { type: String, required: true },
        rejectionReason: { type: String, default: null },
    },
    { timestamps: true },
);

export default AiContentReviewSchema;
