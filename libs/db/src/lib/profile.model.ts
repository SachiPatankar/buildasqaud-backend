import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILink {
  name: string;
  link: string;
}

export interface IProfile extends Document {
  _id: string;
  user_id: string;
  title?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  links: ILink[];
  location_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    name: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    user_id: { type: String, required: true },
    title: { type: String },
    bio: { type: String },
    college: { type: String },
    branch: { type: String },
    year: { type: String },
    links: [LinkSchema],
    location_id: { type: String },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
