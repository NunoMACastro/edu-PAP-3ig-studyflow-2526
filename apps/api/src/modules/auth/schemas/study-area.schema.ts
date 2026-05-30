import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyAreaDocument = HydratedDocument<StudyArea>;

@Schema({ timestamps: true, collection: "study_areas" })
export class StudyArea {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 120 })
    name!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ trim: true, maxlength: 24 })
    color?: string;

    @Prop({ default: false })
    archived!: boolean;

    @Prop({ enum: ["simple", "rigorous", "step_by_step", "examples_first"] })
    voiceTone?: string;

    @Prop({ enum: ["short", "normal", "detailed"], default: "normal" })
    voiceDetailLevel?: string;

    @Prop({ trim: true, maxlength: 500 })
    voiceNotes?: string;
}

export const StudyAreaSchema = SchemaFactory.createForClass(StudyArea);
StudyAreaSchema.index({ userId: 1, name: 1 }, { unique: true });