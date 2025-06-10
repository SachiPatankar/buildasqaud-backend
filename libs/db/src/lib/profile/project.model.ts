import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProject extends Document {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  technologies?: string[];
  project_url?: string;
  github_url?: string;
  start_date?: Date;
  end_date?: Date;
  is_current?: boolean;
  created_at: Date;
  updated_at: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    project_url: {
      type: String,
      trim: true,
    },
    github_url: {
      type: String,
      trim: true,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    is_current: {
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

ProjectSchema.index({ user_id: 1 });
ProjectSchema.index({ technologies: 1 });

export const ProjectModel = mongoose.model<IProject>(
  'ProjectModel',
  ProjectSchema
);
