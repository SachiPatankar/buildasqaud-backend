import { Schema, model, Document } from 'mongoose';

export interface ILocation extends Document {
  city?: string;
  state?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    city: { type: String },
    state: { type: String },
    country: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

export const Location = model<ILocation>('Location', LocationSchema);
