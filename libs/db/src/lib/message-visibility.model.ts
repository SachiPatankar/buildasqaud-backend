// libs/db/src/models/messageVisibility.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessageVisibility extends Document {
  _id: string;
  message_id: string;
  user_id: string;
  visible: boolean;
  updated_at?: Date;
}

const MessageVisibilitySchema = new Schema<IMessageVisibility>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    message_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    visible: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
    },
  }
);

// Unique index to avoid duplicate visibility records per user per message
MessageVisibilitySchema.index({ message_id: 1, user_id: 1 }, { unique: true });

export const MessageVisibility = mongoose.model<IMessageVisibility>(
  'MessageVisibility',
  MessageVisibilitySchema
);
