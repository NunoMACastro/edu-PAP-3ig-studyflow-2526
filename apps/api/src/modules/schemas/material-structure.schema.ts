// apps/api/src/modules/material-structure/schemas/material-structure.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MaterialStructureDocument = HydratedDocument<MaterialStructure>;
export type MaterialReference = {
    chunkOrder: number;
    sourceLabel: string;
    locator: string;
    excerpt: string;
};
export type MaterialSection = {
    order: number;
    title: string;
    summary: string;
    references: MaterialReference[];
};

@Schema({ timestamps: true, collection: "material_structures" })
export class MaterialStructure {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    materialId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    ownerId!: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    topics!: string[];

    @Prop({
        type: [
            {
                order: Number,
                title: String,
                summary: String,
                references: [
                    {
                        chunkOrder: Number,
                        sourceLabel: String,
                        locator: String,
                        excerpt: String,
                    },
                ],
            },
        ],
        default: [],
    })
    sections!: MaterialSection[];
}

export const MaterialStructureSchema = SchemaFactory.createForClass(MaterialStructure);
MaterialStructureSchema.index({ jobId: 1 }, { unique: true });