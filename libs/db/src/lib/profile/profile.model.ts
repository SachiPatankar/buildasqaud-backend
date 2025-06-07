// profile.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILink {
  name: string;
  url: string;
}

export interface IProfile extends Document {
  _id: string;
  user_id: string;
  title?: string;
  bio?: string;
  location_id?: string;
  connections_count: number;
  links: ILink[];
  created_at?: Date;
  updated_at?: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    url: { 
      type: String, 
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: { 
      type: String, 
      required: true,
      unique: true,
    },
    title: { 
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: { 
      type: String,
      trim: true,
      maxlength: 500,
    },
    location_id: { 
      type: String,
    },
    connections_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    links: [LinkSchema],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

ProfileSchema.index({ user_id: 1 }, { unique: true });

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);