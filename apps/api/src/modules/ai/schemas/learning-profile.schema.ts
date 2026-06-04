// apps/api/src/modules/ai/schemas/learning-profile.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LearningProfileDocument = HydratedDocument<LearningProfile>;
export type LearningPace = "SLOW" | "BALANCED" | "FAST";
export type LearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

@Schema({ timestamps: true, collection: "learning_profiles" })
export class LearningProfile {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: ["SLOW", "BALANCED", "FAST"], default: "BALANCED" })
    pace!: LearningPace;

    @Prop({ required: true, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" })
    level!: LearningLevel;

    @Prop({ type: [String], default: [] })
    difficulties!: string[];

    @Prop({ trim: true, maxlength: 200 })
    preferredExplanationStyle?: string;
}

export const LearningProfileSchema = SchemaFactory.createForClass(LearningProfile);
LearningProfileSchema.index({ userId: 1, studyAreaId: 1 }, { unique: true });