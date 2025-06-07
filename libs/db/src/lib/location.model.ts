import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILocation extends Document {
  _id: string;
  city?: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  created_at?: Date;
  updated_at?: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    city: { 
      type: String,
      trim: true,
    },
    state: { 
      type: String,
      trim: true,
    },
    country: { 
      type: String, 
      required: true,
      trim: true,
    },
    coordinates: {
      latitude: { 
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: { 
        type: Number,
        min: -180,
        max: 180,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const Location = mongoose.model<ILocation>('Location', LocationSchema);