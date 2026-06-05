// apps/api/src/modules/class-ai/schemas/class-ai-interaction.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type ClassAiInteractionDocument = HydratedDocument<ClassAiInteraction>;

@Schema({ timestamps: true, collection: "class_ai_interactions" })
export class ClassAiInteraction {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 800 })
    question!: string;

    @Prop({ required: true, trim: true, maxlength: 12000 })
    answer!: string;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sources!: Array<{ materialId: string; title: string }>;
}

export const ClassAiInteractionSchema = SchemaFactory.createForClass(ClassAiInteraction);
ClassAiInteractionSchema.index({ studentId: 1, subjectId: 1, createdAt: -1 });