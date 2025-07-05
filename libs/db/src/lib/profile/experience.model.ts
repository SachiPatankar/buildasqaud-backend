import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IExperience extends Document {
  _id: string;
  user_id: string;
  company_name: string;
  position: string;
  start_date: Date;
  end_date?: Date;
  is_current: boolean;
  description?: string;
  location_id?: string;
  employment_type?:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'internship'
    | 'freelance';
  created_at: Date;
  updated_at: Date;
  order: number;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: {
      type: String,
      required: true,
    },
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    is_current: {
      type: Boolean,
      default: false,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    employment_type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    },
    location_id: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

ExperienceSchema.index({ user_id: 1 });

export const ExperienceModel = mongoose.model<IExperience>(
  'ExperienceModel',
  ExperienceSchema
);
