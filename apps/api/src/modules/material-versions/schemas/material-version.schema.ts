// apps/api/src/modules/material-versions/schemas/material-version.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialVersionDocument = HydratedDocument<MaterialVersion>;

@Schema({ timestamps: true, collection: "material_versions" })
export class MaterialVersion {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    versionNumber!: number;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 300 })
    title!: string;

    @Prop({ type: [String], default: [] })
    changeSummary!: string[];
}

export const MaterialVersionSchema = SchemaFactory.createForClass(MaterialVersion);
MaterialVersionSchema.index({ materialId: 1, versionNumber: -1 });