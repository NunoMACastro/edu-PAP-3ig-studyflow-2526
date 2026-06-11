// apps/api/src/modules/class-ai/schemas/class-ai-answer.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassAiAnswerDocument = HydratedDocument<ClassAiAnswer>;

@Schema({ timestamps: true, collection: "class_ai_answers" })
export class ClassAiAnswer {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 4000 })
    question!: string;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 20000 })
    answer!: string;

    @Prop({ type: [String], default: [] })
    officialMaterialIds!: string[];

    @Prop({ type: [String], default: [] })
    teacherVoiceRules!: string[];
}

export const ClassAiAnswerSchema = SchemaFactory.createForClass(ClassAiAnswer);
ClassAiAnswerSchema.index({ subjectId: 1, studentId: 1, createdAt: -1 });