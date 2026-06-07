import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassPostDocument = HydratedDocument<ClassPost>;
export type ClassPostType = "NOTICE" | "POST";

/**
 * Aviso ou publicação oficial de uma turma.
 */
@Schema({ timestamps: true, collection: "class_posts" })
export class ClassPost {
    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTICE", "POST"] })
    type!: ClassPostType;

    @Prop({ required: true, trim: true, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, maxlength: 4000 })
    body!: string;
}

export const ClassPostSchema = SchemaFactory.createForClass(ClassPost);
ClassPostSchema.index({ classId: 1, createdAt: -1 });
