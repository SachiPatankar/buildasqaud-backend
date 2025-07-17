import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILink {
  name: string;
  url: string;
}

export interface IUser extends Document {
  _id: string;
  email: string;
  first_name: string;
  last_name?: string;
  password?: string;
  photo?: string;
  googleId?: string;
  githubId?: string;
  title?: string;
  bio?: string;
  location_id?: string;
  connections_count: number;
  links?: ILink[];
  is_online?: boolean;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
  refreshToken: string;
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

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    photo: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
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
    is_online: {
      type: Boolean,
      default: false,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
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

UserSchema.index({
  first_name: 'text',
  last_name: 'text',
  title: 'text',
  bio: 'text',
});

export const UserModel = mongoose.model<IUser>('UserModel', UserSchema);
