import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudyGoalDocument = HydratedDocument<StudyGoal>;

@Schema({ timestamps: true, collection: 'study_goals' })
export class StudyGoal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, min: 1 })
  targetValue!: number;

  @Prop({ required: true, enum: ['minutes', 'sessions', 'materials'] })
  metric!: string;

  @Prop({ default: false })
  completed!: boolean;
}

export const StudyGoalSchema = SchemaFactory.createForClass(StudyGoal);