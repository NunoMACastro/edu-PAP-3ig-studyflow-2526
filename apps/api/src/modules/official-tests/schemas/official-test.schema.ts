// apps/api/src/modules/official-tests/schemas/official-test.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type OfficialTestDocument = HydratedDocument<OfficialTest>;
export type OfficialTestQuestion = { statement: string; options: string[]; correctAnswer: string };

@Schema({ timestamps: true, collection: "official_tests" })
export class OfficialTest {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    subjectId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, enum: ["MINI_TEST", "TEST"] })
    type!: "MINI_TEST" | "TEST";

    @Prop({ type: [{ statement: String, options: [String], correctAnswer: String }], default: [] })
    questions!: OfficialTestQuestion[];
}

export const OfficialTestSchema = SchemaFactory.createForClass(OfficialTest);
OfficialTestSchema.index({ subjectId: 1, createdAt: -1 });
