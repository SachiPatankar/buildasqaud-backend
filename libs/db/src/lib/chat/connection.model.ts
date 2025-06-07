import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IConnection extends Document {
  _id: string;
  requester_profile_id: string;
  addressee_profile_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string; // Optional message when sending connection request
  chat_id?: string; // Created when connection is accepted
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
    requester_profile_id: { 
      type: String, 
      required: true,
    },
    addressee_profile_id: { 
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

ConnectionSchema.index({ 
  requester_profile_id: 1, 
  addressee_profile_id: 1 
}, { unique: true });

ConnectionSchema.index({ requester_profile_id: 1, status: 1 });
ConnectionSchema.index({ addressee_profile_id: 1, status: 1 });
ConnectionSchema.index({ status: 1, created_at: -1 });

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);