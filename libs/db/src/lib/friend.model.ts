import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum FriendStatus {
  REQUESTED = 'REQUESTED',
  INCOMING = 'INCOMING',
  FRIEND = 'FRIEND',
}

export enum FriendshipType {
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

export interface IFriend extends Document {
  _id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
  friendship_type: FriendshipType;
  chat_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

const FriendSchema = new Schema<IFriend>(
  {
    _id: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    user_id: { type: String, required: true },
    friend_id: { type: String, required: true },
    status: {
      type: String,
      enum: FriendStatus,
      default: FriendStatus.REQUESTED,
    },
    friendship_type: {
      type: String,
      enum: FriendshipType,
      default: FriendshipType.PENDING,
    },
    chat_id: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const Friend = mongoose.model<IFriend>('Friend', FriendSchema);
