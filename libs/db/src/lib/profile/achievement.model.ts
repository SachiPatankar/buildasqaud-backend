import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAchievement extends Document {
  _id: string;
  title: string;
  description?: string;
  profile_id: string;
  created_at?: Date;
  updated_at?: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    title: { type: String, required: true },
    description: { type: String },
    profile_id: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const HackathonWin = mongoose.model<IAchievement>(
  'Achievement',
  AchievementSchema
);
