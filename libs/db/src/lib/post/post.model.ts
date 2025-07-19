// post.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRequirement {
  desired_skills?: string[];
  desired_roles?: string[];
}

export interface IPost extends Document {
  _id: string;
  title: string;
  description?: string;
  posted_by: string;
  requirements?: IRequirement;
  tech_stack?: string[];
  project_phase?: string;
  project_type?: string;
  work_mode?: 'remote' | 'hybrid' | 'in person' | 'not stated';
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'any'; // Added for experience level
  location_id?: string;
  status: 'open' | 'closed';
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
    },
    project_type: {
      type: String,
    },
    work_mode: {
      type: String,
      enum: ['remote', 'hybrid', 'in person', 'not stated'],
      default: 'not stated',
    },
    experience_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'any'],
      default: 'any',
    },
    location_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
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

PostSchema.index({
  title: 'text',
  description: 'text',
  tech_stack: 'text',
  project_type: 'text',
  'requirements.desired_skills': 'text',
  'requirements.desired_roles': 'text',
});

export const PostModel = mongoose.model<IPost>('PostModel', PostSchema);
