import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyAreaDocument = HydratedDocument<StudyArea>;

export type StudyAreaVoiceTone = "simple" | "rigorous" | "step_by_step" | "examples_first";
export type StudyAreaVoiceDetailLevel = "short" | "normal" | "detailed";

@Schema({ timestamps: true, collection: "study_areas" })
export class StudyArea {
    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ trim: true, maxlength: 32 })
    color?: string;

    @Prop({ default: false })
    archived?: boolean;

    @Prop()
    voiceTone?: StudyAreaVoiceTone;

    @Prop()
    voiceDetailLevel?: StudyAreaVoiceDetailLevel;

    @Prop({ trim: true, maxlength: 2000 })
    voiceNotes?: string;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;
}

export const StudyAreaSchema = SchemaFactory.createForClass(StudyArea);
