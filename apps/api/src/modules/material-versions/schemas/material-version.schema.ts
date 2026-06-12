import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialVersionDocument = HydratedDocument<MaterialVersion>;
export type MaterialVersionScope = "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
export type MaterialVersionChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

/**
 * Versão registada de um material privado ou oficial.
 */
@Schema({ timestamps: true, collection: "material_versions" })
export class MaterialVersion {
    @Prop({ required: true, enum: ["PRIVATE_AREA", "OFFICIAL_SUBJECT"], index: true })
    scope!: MaterialVersionScope;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "MaterialIndexJob", required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    studyAreaId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, index: true })
    teacherId?: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    versionNumber!: number;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 20000 })
    textSnapshot?: string;

    @Prop({ type: [Object], default: [] })
    chunksSnapshot!: MaterialVersionChunk[];

    @Prop({ trim: true, maxlength: 1000 })
    changeSummary?: string;

    @Prop({ required: true, default: true })
    active!: boolean;
}

export const MaterialVersionSchema = SchemaFactory.createForClass(MaterialVersion);
MaterialVersionSchema.index({ materialId: 1, scope: 1, versionNumber: -1 });
