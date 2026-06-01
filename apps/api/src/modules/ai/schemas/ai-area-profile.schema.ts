import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiAreaProfileDocument = HydratedDocument<AiAreaProfile>;
export type AiAreaProfileStatus =
    | "MISSING_MATERIALS"
    | "PENDING_PROCESSING"
    | "READY_FOR_GENERATION";

@Schema({ timestamps: true, collection: "ai_area_profiles" })
export class AiAreaProfile {
    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        unique: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: [
            "MISSING_MATERIALS",
            "PENDING_PROCESSING",
            "READY_FOR_GENERATION",
        ],
    })
    status!: AiAreaProfileStatus;

    @Prop({ default: 0, min: 0 })
    sourceCount!: number;

    @Prop({ default: 0, min: 0 })
    processableSourceCount!: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Material" }], default: [] })
    materialIds!: Types.ObjectId[];

    @Prop()
    voiceTone?: string;
}

export const AiAreaProfileSchema = SchemaFactory.createForClass(AiAreaProfile);