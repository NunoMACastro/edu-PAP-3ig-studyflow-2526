// apps/api/src/modules/class-projects/schemas/class-project.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClassProjectDocument = HydratedDocument<ClassProject>;
export type ClassProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

@Schema({ timestamps: true, collection: "class_projects" })
export class ClassProject {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 20, maxlength: 12000 })
    brief!: string;

    @Prop({ type: Date })
    dueDate?: Date;

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" })
    status!: ClassProjectStatus;
}

export const ClassProjectSchema = SchemaFactory.createForClass(ClassProject);
ClassProjectSchema.index({ classId: 1, status: 1, createdAt: -1 });