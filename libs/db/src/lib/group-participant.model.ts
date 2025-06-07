// libs/db/src/models/groupChatParticipant.ts

import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum GroupRole {
  PARTICIPANT = 'PARTICIPANT',
  ADMIN = 'ADMIN',
}

export interface IGroupParticipant extends Document {
  _id: string;
  chat_id: string; // group chat id
  user_id: string;
  role: GroupRole;
  joined_at?: Date;
  updated_at?: Date;
}

const GroupParticipantSchema = new Schema<IGroupParticipant>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    chat_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: Object.values(GroupRole),
      default: GroupRole.PARTICIPANT,
    },
  },
  {
    timestamps: {
      createdAt: 'joined_at',
      updatedAt: 'updated_at',
    },
  }
);

// Ensure one user per group chat only once
GroupParticipantSchema.index({ chat_id: 1, user_id: 1 }, { unique: true });

export const GroupChatParticipant = mongoose.model<IGroupParticipant>(
  'GroupParticipant',
  GroupParticipantSchema
);
