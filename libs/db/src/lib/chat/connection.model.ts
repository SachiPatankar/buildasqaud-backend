import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IConnection extends Document {
  _id: string;
  requester_user_id: string;
  addressee_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string; 
  chat_id?: string; 
  created_at?: Date;
  updated_at?: Date;
  responded_at?: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    requester_user_id: {
      type: String,
      required: true,
    },
    addressee_user_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'blocked'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    chat_id: {
      type: String,
    },
    responded_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

ConnectionSchema.index(
  {
    requester_user_id: 1,
    addressee_user_id: 1,
  },
  { unique: true }
);

ConnectionSchema.index({ requester_user_id: 1, status: 1 });
ConnectionSchema.index({ addressee_user_id: 1, status: 1 });
ConnectionSchema.index({ status: 1, created_at: -1 });

export const ConnectionModel = mongoose.model<IConnection>(
  'ConnectionModel',
  ConnectionSchema
);
