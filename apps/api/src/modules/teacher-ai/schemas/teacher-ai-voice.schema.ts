import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TeacherAiVoiceDocument = HydratedDocument<TeacherAiVoice>;
export type TeacherAiTone = "CALM" | "DIRECT" | "SOCRATIC";
export type TeacherAiDetailLevel = "SHORT" | "BALANCED" | "DETAILED";

/**
 * Voz pedagógica textual definida pelo professor para uma disciplina.
 */
@Schema({ timestamps: true, collection: "teacher_ai_voices" })
export class TeacherAiVoice {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["CALM", "DIRECT", "SOCRATIC"], default: "CALM" })
    tone!: TeacherAiTone;

    @Prop({
        required: true,
        enum: ["SHORT", "BALANCED", "DETAILED"],
        default: "BALANCED",
    })
    detailLevel!: TeacherAiDetailLevel;

    @Prop({ type: [String], default: [] })
    rules!: string[];
}

export const TeacherAiVoiceSchema = SchemaFactory.createForClass(TeacherAiVoice);
TeacherAiVoiceSchema.index({ subjectId: 1 }, { unique: true });
