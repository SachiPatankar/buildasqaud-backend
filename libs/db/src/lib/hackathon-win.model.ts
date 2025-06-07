import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IHackathonWin extends Document {
  _id: string;
  title: string;
  rank?: string;
  description?: string;
  profile_id: string;
  created_at?: Date;
  updated_at?: Date;
}

const HackathonWinSchema = new Schema<IHackathonWin>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    title: { type: String, required: true },
    rank: { type: String },
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

export const HackathonWin = mongoose.model<IHackathonWin>(
  'HackathonWin',
  HackathonWinSchema
);
