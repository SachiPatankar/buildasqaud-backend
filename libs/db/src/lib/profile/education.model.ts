import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IEducation extends Document {
  _id: string;
  user_id: string;
  institution_name: string;
  location_id?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: Date;
  end_date?: Date;
  is_current?: boolean;
  grade?: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: {
      type: String,
      required: true,
    },
    institution_name: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    field_of_study: {
      type: String,
      trim: true,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    is_current: {
      type: Boolean,
      default: false,
    },
    grade: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location_id: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

EducationSchema.index({ user_id: 1 });

export const EducationModel = mongoose.model<IEducation>(
  'EducationModel',
  EducationSchema
);
