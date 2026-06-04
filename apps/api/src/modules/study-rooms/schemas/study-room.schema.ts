// apps/api/src/modules/study-rooms/schemas/study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StudyRoomDocument = HydratedDocument<StudyRoom>;
export type StudyRoomType = "FREE" | "SUBJECT";

@Schema({ timestamps: true, collection: "study_rooms" })
export class StudyRoom {
    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    ownerStudentId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
    name!: string;

    @Prop({ required: true, enum: ["FREE", "SUBJECT"], default: "FREE" })
    type!: StudyRoomType;

    // `disciplineName` é textual para este BK não depender da entidade oficial de disciplinas, criada apenas em BK-MF1-08.
    @Prop({ trim: true, maxlength: 120 })
    disciplineName?: string;

    @Prop({ trim: true, maxlength: 500 })
    description?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [], index: true })
    memberIds!: Types.ObjectId[];
}

export const StudyRoomSchema = SchemaFactory.createForClass(StudyRoom);
StudyRoomSchema.index({ memberIds: 1, createdAt: -1 });