/// <reference path="../../../types/ambient.d.ts" />
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export const MATERIAL_TYPES = ["PDF", "DOCX", "URL", "TOPIC"] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const MATERIAL_STATUS = ["PENDING_PROCESSING", "READY", "FAILED"] as const;
export type MaterialStatus = (typeof MATERIAL_STATUS)[number];

export type MaterialDocument = HydratedDocument<Material>;

@Schema({ timestamps: true, collection: "materials" })
export class Material {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "StudyArea", required: true, index: true })
    studyAreaId!: Types.ObjectId;

    @Prop({ required: true, enum: MATERIAL_TYPES })
    type!: MaterialType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({
        required: true,
        enum: MATERIAL_STATUS,
        default: "PENDING_PROCESSING",
    })
    status!: MaterialStatus;

    @Prop({ trim: true })
    url?: string;

    @Prop()
    storageKey?: string;

    @Prop()
    originalName?: string;

    @Prop()
    mimeType?: string;

    @Prop({ min: 0 })
    sizeBytes?: number;

    @Prop({ maxlength: 10000 })
    contentText?: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.index({ userId: 1, studyAreaId: 1, createdAt: -1 });
MaterialSchema.index({ status: 1 });
MaterialSchema.index({ status: 1, createdAt: 1 });
