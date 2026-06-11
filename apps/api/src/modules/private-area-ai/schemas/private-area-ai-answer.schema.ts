// apps/api/src/modules/private-area-ai/schemas/private-area-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type PrivateAreaAiAnswerDocument = HydratedDocument<PrivateAreaAiAnswer>;

@Schema({ timestamps: true, collection: "private_area_ai_answers" })
export class PrivateAreaAiAnswer {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 4000 })
    question!: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 20000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    sourceMaterialIds!: string[];
}

export const PrivateAreaAiAnswerSchema = SchemaFactory.createForClass(PrivateAreaAiAnswer);
PrivateAreaAiAnswerSchema.index({ studyAreaId: 1, studentId: 1, createdAt: -1 });