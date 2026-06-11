// apps/api/src/modules/material-index/schemas/material-index-job.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialIndexJobDocument = HydratedDocument<MaterialIndexJob>;
export type MaterialIndexStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
export type MaterialIndexScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";

export type MaterialTextChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

@Schema({ timestamps: true, collection: "material_index_jobs" })
export class MaterialIndexJob {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    contextId!: Types.ObjectId;

    @Prop({ required: true, enum: ["PRIVATE_AREA", "OFFICIAL_SUBJECT"] })
    scope!: MaterialIndexScope;

    @Prop({ required: true, enum: ["QUEUED", "PROCESSING", "DONE", "FAILED"], default: "QUEUED" })
    status!: MaterialIndexStatus;

    @Prop({
        type: [
            {
                order: { type: Number, required: true, min: 1 },
                text: { type: String, required: true, trim: true },
                sourceLabel: { type: String, required: true, trim: true },
                locator: { type: String, required: true, trim: true },
            },
        ],
        default: [],
    })
    extractedTextChunks!: MaterialTextChunk[];

    @Prop({ trim: true })
    errorMessage?: string;
}

export const MaterialIndexJobSchema = SchemaFactory.createForClass(MaterialIndexJob);
MaterialIndexJobSchema.index({ materialId: 1, contextId: 1, scope: 1 });