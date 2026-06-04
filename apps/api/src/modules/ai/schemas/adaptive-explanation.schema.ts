// apps/api/src/modules/ai/schemas/adaptive-explanation.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type AdaptiveExplanationDocument = HydratedDocument<AdaptiveExplanation>;

@Schema({ timestamps: true, collection: "adaptive_explanations" })
export class AdaptiveExplanation {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 300 })
    topic!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;

    @Prop({ type: [String], default: [] })
    adaptationNotes!: string[];
}

export const AdaptiveExplanationSchema = SchemaFactory.createForClass(AdaptiveExplanation);
AdaptiveExplanationSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });