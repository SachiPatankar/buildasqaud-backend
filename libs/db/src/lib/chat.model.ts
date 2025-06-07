// libs/db/src/models/oneToOneChat.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IChat extends Document {
  _id: string;
  participant_ids: [string, string]; // exactly two participants
  created_at?: Date;
  updated_at?: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
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
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Index to quickly find 1:1 chat by participants (both participants in array)
ChatSchema.index({ participant_ids: 1 });

export const Chat = mongoose.model<IChat>('OneToOneChat', ChatSchema);
