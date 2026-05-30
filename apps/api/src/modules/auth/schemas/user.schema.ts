import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudyEventDocument = HydratedDocument<StudyEvent>;

@Schema({
  timestamps: true,
  collection: 'study_events',
})
export class StudyEvent {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    enum: [
      'lesson_started',
      'lesson_completed',
      'quiz_started',
      'quiz_completed',
    ],
  })
  type!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  title!: string;

  @Prop({
    type: Map,
    of: Object,
    default: {},
  })
  metadata?: Record<string, unknown>;
}

export const StudyEventSchema =
  SchemaFactory.createForClass(StudyEvent);

StudyEventSchema.index({
  userId: 1,
  createdAt: -1,
});

StudyEventSchema.index({
  userId: 1,
  type: 1,
  createdAt: -1,
});