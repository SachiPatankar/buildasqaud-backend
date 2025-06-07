import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
  _id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  photo?: string;
  googleId?: string;
  githubId?: string;
  profile_id: string;
  is_online?: boolean;
  last_seen?: Date;
  created_at?: Date;
  updated_at?: Date;
}

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
    profile_id: {
      type: String,
      required: true,
    },
    is_online: {
      type: Boolean,
      default: false,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', UserSchema);
