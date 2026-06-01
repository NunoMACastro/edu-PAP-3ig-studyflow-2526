import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type AiArtifactDocument = HydratedDocument<AiArtifact>;
export type AiArtifactType = "SUMMARY" | "EXPLANATION" | "FLASHCARDS" | "QUIZ";

@Schema({ timestamps: true, collection: "ai_artifacts" })
export class AiArtifact {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "StudyArea",
        required: true,
        index: true,
    })
    studyAreaId!: Types.ObjectId;

    @Prop({
        required: true,
        enum: ["SUMMARY", "EXPLANATION", "FLASHCARDS", "QUIZ"],
    })
    type!: AiArtifactType;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    contentJson!: Record<string, unknown>;

    @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
    sourcesJson!: Array<Record<string, unknown>>;
}

export const AiArtifactSchema = SchemaFactory.createForClass(AiArtifact);