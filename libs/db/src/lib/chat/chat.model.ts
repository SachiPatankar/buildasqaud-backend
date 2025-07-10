// chat.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IChat extends Document {
  _id: string;
  participant_ids: [string, string];
  last_message_id?: string;
  last_message_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    participant_ids: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length === 2,
        'Must have exactly 2 participants',
      ],
    },
    last_message_id: {
      type: String,
    },
    last_message_at: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);


export const ChatModel = mongoose.model<IChat>('ChatModel', ChatSchema);
