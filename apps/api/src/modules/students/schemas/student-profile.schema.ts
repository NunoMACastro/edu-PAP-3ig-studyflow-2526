import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

@Schema({ timestamps: true, collection: 'student_profiles' })
export class StudentProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  year?: string;

  @Prop({ trim: true })
  course?: string;

  @Prop({ trim: true })
  className?: string;
}

export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);