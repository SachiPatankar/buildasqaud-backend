import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUserSkill extends Document {
  _id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  is_top: Boolean;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const UserSkillSchema = new Schema<IUserSkill>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: {
      type: String,
      required: true,
    },
    skill_name: {
      type: String,
      required: true,
      trim: true,
    },
    proficiency_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    years_experience: {
      type: Number,
      min: 0,
      max: 50,
    },
    is_top: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

UserSkillSchema.index({ skill_name: 'text' });

export const UserSkillModel = mongoose.model<IUserSkill>(
  'UserSkillModel',
  UserSkillSchema
);
