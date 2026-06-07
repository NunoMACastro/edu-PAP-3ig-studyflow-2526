import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoomDocument = HydratedDocument<StudyRoom>;
export type StudyRoomType = "FREE" | "SUBJECT";

/**
 * Sala colaborativa entre alunos.
 */
@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    @Prop({ trim: true, maxlength: 120 })
    disciplineName?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });
