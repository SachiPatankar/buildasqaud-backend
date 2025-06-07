import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IExperience extends Document {
  _id: string;
  profile_id: string;
  company: string;
  position?: string;
  duration?: string;
  location_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    profile_id: { type: String, required: true },
    company: { type: String, required: true },
    position: { type: String },
    duration: { type: String },
    location_id: { type: String },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const Experience = mongoose.model<IExperience>(
  'Experience',
  ExperienceSchema
);
