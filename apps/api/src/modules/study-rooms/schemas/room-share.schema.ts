// apps/api/src/modules/study-rooms/schemas/room-share.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoomShareDocument = HydratedDocument<RoomShare>;
export type RoomShareType = "NOTE" | "URL" | "MATERIAL_REF";

@Schema({ timestamps: true, collection: "room_shares" })
export class RoomShare {
    @Prop({ type: Types.ObjectId, ref: "StudyRoom", required: true, index: true })
    roomId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
    authorStudentId!: Types.ObjectId;

    @Prop({ required: true, enum: ["NOTE", "URL", "MATERIAL_REF"] })
    type!: RoomShareType;

    @Prop({ required: true, trim: true, minlength: 2, maxlength: 160 })
    title!: string;

    @Prop({ trim: true, maxlength: 12000 })
    textContent?: string;

    @Prop({ trim: true, maxlength: 1000 })
    sourceUrl?: string;

    @Prop({ type: Types.ObjectId, ref: "Material" })
    materialId?: Types.ObjectId;

    @Prop({ required: true, default: false })
    usableByAi!: boolean;
}

export const RoomShareSchema = SchemaFactory.createForClass(RoomShare);
RoomShareSchema.index({ roomId: 1, createdAt: -1 });
RoomShareSchema.index({ roomId: 1, usableByAi: 1 });