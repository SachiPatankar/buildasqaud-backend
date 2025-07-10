import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage extends Document {
  _id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  read_by: {
    user_id: string;
    read_at: Date;
  }[];
  edited_at?: Date;
  is_deleted: boolean;
  deleted_for: string[];
  reply_to_message_id?: string;
  created_at: Date;
  updated_at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    chat_id: {
      type: String,
      required: true,
    },
    sender_id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    read_by: [
      {
        user_id: { type: String, required: true },
        read_at: { type: Date, required: true },
      },
    ],
    edited_at: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_for: [
      {
        type: String,
      },
    ],
    reply_to_message_id: {
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


export const MessageModel = mongoose.model<IMessage>(
  'MessageModel',
  MessageSchema
);
