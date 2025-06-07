// libs/db/src/models/groupChat.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IGroupChat extends Document {
  _id: string;
  name: string;
  is_group: true;
  created_at?: Date;
  updated_at?: Date;
}

const GroupChatSchema = new Schema<IGroupChat>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    name: { type: String, required: true },
    is_group: { type: Boolean, default: true, immutable: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const GroupChat = mongoose.model<IGroupChat>(
  'GroupChat',
  GroupChatSchema
);
