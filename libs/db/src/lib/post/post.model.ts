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
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'any';
  location_id?: string;
  status: 'open' | 'closed';
  views_count: number;
  applications_count: number;
  // New fields for recommendation system
  popularity_score?: number; // Calculated based on views, applications, recency
  skill_match_score?: number; // For user-post matching
  search_keywords?: string[]; // Extracted keywords for better search
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
    // New fields for recommendation system
    popularity_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    skill_match_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    search_keywords: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Enhanced text search index with weights
PostSchema.index({
  title: 'text',
  description: 'text',
  tech_stack: 'text',
  project_type: 'text',
  'requirements.desired_skills': 'text',
  'requirements.desired_roles': 'text',
  search_keywords: 'text',
}, {
  weights: {
    title: 10,
    description: 6,
    tech_stack: 8,
    project_type: 7,
    'requirements.desired_skills': 9,
    'requirements.desired_roles': 9,
    search_keywords: 5,
  },
  name: 'post_text_search'
});

// Performance indexes for common queries
PostSchema.index({ posted_by: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ created_at: -1 });
PostSchema.index({ updated_at: -1 });
PostSchema.index({ views_count: -1 });
PostSchema.index({ applications_count: -1 });
PostSchema.index({ popularity_score: -1 });
PostSchema.index({ location_id: 1 });
PostSchema.index({ experience_level: 1 });
PostSchema.index({ work_mode: 1 });
PostSchema.index({ project_type: 1 });

// Compound indexes for complex queries
PostSchema.index({ 
  status: 1, 
  created_at: -1 
});

PostSchema.index({ 
  status: 1, 
  location_id: 1, 
  experience_level: 1 
});

PostSchema.index({ 
  status: 1, 
  tech_stack: 1, 
  popularity_score: -1 
});

PostSchema.index({ 
  status: 1, 
  project_type: 1, 
  created_at: -1 
});

// Pre-save middleware to update derived fields
PostSchema.pre('save', async function(next) {
  if (this.isModified('views_count') || this.isModified('applications_count') || 
      this.isModified('created_at')) {
    
    // Calculate popularity score
    const daysSinceCreation = (Date.now() - this.created_at.getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.1, 1 - (daysSinceCreation / 30)); // Decay over 30 days
    
    this.popularity_score = (
      (this.views_count * 0.3) + 
      (this.applications_count * 0.7) + 
      (recencyFactor * 10)
    );
    
    // Extract search keywords from title and description
    const text = `${this.title} ${this.description || ''} ${this.tech_stack?.join(' ') || ''}`;
    const keywords = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to 10 keywords
    
    this.search_keywords = [...new Set(keywords)];
  }
  next();
});

export const PostModel = mongoose.model<IPost>('PostModel', PostSchema);
