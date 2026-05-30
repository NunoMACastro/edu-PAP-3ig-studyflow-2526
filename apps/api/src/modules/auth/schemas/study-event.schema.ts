import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudyEventDocument = HydratedDocument<StudyEvent>;

@Schema({ timestamps: true, collection: 'study_events' })
export class StudyEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  type!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const StudyEventSchema = SchemaFactory.createForClass(StudyEvent);
StudyEventSchema.index({ userId: 1, createdAt: -1 });