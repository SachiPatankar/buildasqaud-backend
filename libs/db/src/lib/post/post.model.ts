// post.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRequirement {
  desired_skills?: string[];
  desired_roles?: string[];
  preferred_experience?: string;
}

export interface IPost extends Document {
  _id: string;
  title: string;
  description?: string;
  posted_by: string; 
  requirements?: IRequirement;
  tech_stack?: string[];
  project_phase?:
    | 'idea'
    | 'planning'
    | 'development'
    | 'testing'
    | 'deployment'
    | 'maintenance';
  people_required?: number;
  project_type?:
    | 'academic'
    | 'startup'
    | 'hackathon'
    | 'open_source'
    | 'personal'
    | 'freelance';
  work_mode?: 'remote' | 'hybrid' | 'in_person';
  location_id?: string; 
  status: 'open' | 'closed' | 'paused' | 'completed';
  views_count: number;
  applications_count: number;
  created_at: Date;
  updated_at: Date;
}

const RequirementSchema = new Schema<IRequirement>(
  {
    desired_skills: [
      {
        type: String,
        trim: true,
      },
    ],
    desired_roles: [
      {
        type: String,
        trim: true,
      },
    ],
    preferred_experience: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    posted_by: {
      type: String,
      required: true,
    },
    requirements: {
      type: RequirementSchema,
    },
    tech_stack: [
      {
        type: String,
        trim: true,
      },
    ],
    project_phase: {
      type: String,
      enum: [
        'idea',
        'planning',
        'development',
        'testing',
        'deployment',
        'maintenance',
      ],
    },
    project_type: {
      type: String,
      enum: [
        'academic',
        'startup',
        'hackathon',
        'open_source',
        'personal',
        'freelance',
      ],
    },
    work_mode: {
      type: String,
      enum: ['remote', 'hybrid', 'in_person'],
    },
    location_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused', 'completed'],
      default: 'open',
    },
    views_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    applications_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Indexes for efficient querying and filtering
PostSchema.index({ posted_by: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ created_at: -1 });

export const PostModel = mongoose.model<IPost>('PostModel', PostSchema);
