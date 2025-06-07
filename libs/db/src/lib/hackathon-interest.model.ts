import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum HackathonInterestStatus {
  INTERESTED = 'INTERESTED',
  UNINTERESTED = 'UNINTERESTED',
}

export interface IHackathonInterest extends Document {
  _id: string;
  user_id: string;
  hackathon_id: string;
  status: HackathonInterestStatus;
  created_at?: Date;
  updated_at?: Date;
}

const HackathonInterestSchema = new Schema<IHackathonInterest>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    user_id: { type: String, required: true },
    hackathon_id: { type: String, required: true },
    status: { type: String, enum: HackathonInterestStatus, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const HackathonInterest = mongoose.model<IHackathonInterest>(
  'HackathonInterest',
  HackathonInterestSchema
);
