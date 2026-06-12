import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OfficialTestDocument = HydratedDocument<OfficialTest>;
export type OfficialTestStatus = "DRAFT" | "PUBLISHED";
export type OfficialTestQuestion = {
    statement: string;
    topic?: string;
    options: string[];
    correctOptionIndex: number;
};

/**
 * Teste ou mini-teste oficial criado por professor.
 */
@Schema({ timestamps: true, collection: "official_tests" })
export class OfficialTest {
    @Prop({ type: Types.ObjectId, ref: "Subject", required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "SchoolClass", required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 4000 })
    description?: string;

    @Prop({ required: true, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" })
    status!: OfficialTestStatus;

    @Prop({ type: [Object], required: true })
    questions!: OfficialTestQuestion[];
}

export const OfficialTestSchema = SchemaFactory.createForClass(OfficialTest);
OfficialTestSchema.index({ subjectId: 1, status: 1, createdAt: -1 });
