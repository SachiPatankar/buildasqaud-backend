// libs/db/src/models/message.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage extends Document {
  _id: string;
  chat_id: string; // oneToOneChat or groupChat id
  sender_id: string;
  message: string;
  read_status: boolean;
  deleted_for_everyone: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    chat_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true, index: true },
    message: { type: String, required: true },
    read_status: { type: Boolean, default: false },
    deleted_for_everyone: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

MessageSchema.index({ chat_id: 1, created_at: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
