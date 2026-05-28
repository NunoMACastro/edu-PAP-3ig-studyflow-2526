import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudyRoutineDocument = HydratedDocument<StudyRoutine>;

@Schema({ timestamps: true, collection: 'study_routines' })
export class StudyRoutine {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, enum: ['daily', 'weekly'] })
  frequency!: string;

  @Prop({ required: true, min: 1 })
  targetMinutes!: number;

  @Prop({ default: true })
  active!: boolean;
}

export const StudyRoutineSchema = SchemaFactory.createForClass(StudyRoutine);