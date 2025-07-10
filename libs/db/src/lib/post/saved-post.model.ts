// libs/db/models/savedPost.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISavedPost extends Document {
  _id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

const SavedPostSchema = new Schema<ISavedPost>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    post_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
    versionKey: false,
  }
);

// ensure a user can’t save the same post twice
export const SavedPostModel = mongoose.model<ISavedPost>(
  'SavedPostModel',
  SavedPostSchema
);
