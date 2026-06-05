// apps/api/src/modules/classes/schemas/school-class.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SchoolClassDocument = HydratedDocument<SchoolClass>;

@Schema({ timestamps: true, collection: "school_classes" })
export class SchoolClass {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, trim: true, uppercase: true, minlength: 2, maxlength: 24 })
    code!: string;

    @Prop({ required: true, trim: true, minlength: 4, maxlength: 20 })
    schoolYear!: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    studentIds!: Types.ObjectId[];
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
SchoolClassSchema.index({ teacherId: 1, code: 1 }, { unique: true });
SchoolClassSchema.index({ studentIds: 1, createdAt: -1 });