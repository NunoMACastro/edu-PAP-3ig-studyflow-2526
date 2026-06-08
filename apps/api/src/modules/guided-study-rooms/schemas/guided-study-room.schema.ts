// apps/api/src/modules/guided-study-rooms/schemas/guided-study-room.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type GuidedStudyRoomDocument = HydratedDocument<GuidedStudyRoom>;
export type GuidedStudyRoomStatus = "OPEN" | "CLOSED";

@Schema({ timestamps: true, collection: "guided_study_rooms" })
export class GuidedStudyRoom {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    classId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    teacherId!: Types.ObjectId;

    @Prop({ required: true, trim: true, minlength: 3, maxlength: 160 })
    title!: string;

    @Prop({ required: true, trim: true, minlength: 5, maxlength: 8000 })
    description!: string;

    @Prop({ type: [String], default: [] })
    materialIds!: string[];

    @Prop({ required: true, enum: ["OPEN", "CLOSED"], default: "OPEN" })
    status!: GuidedStudyRoomStatus;
}

export const GuidedStudyRoomSchema = SchemaFactory.createForClass(GuidedStudyRoom);
GuidedStudyRoomSchema.index({ classId: 1, createdAt: -1 });

