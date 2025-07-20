import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILink {
  name: string;
  url: string;
}

export interface IUser extends Document {
  _id: string;
  email: string;
  first_name: string;
  last_name?: string;
  password?: string;
  photo?: string;
  googleId?: string;
  githubId?: string;
  title?: string;
  bio?: string;
  location_id?: string;
  connections_count: number;
  links?: ILink[];
  is_online?: boolean;
  last_seen?: Date;
  // New fields for recommendation system
  skills_summary?: string[]; // Cached top skills for quick search
  experience_summary?: string; // Cached experience level
  search_score?: number; // For recommendation ranking
  profile_completeness?: number; // Profile completion percentage
  created_at: Date;
  updated_at: Date;
  refreshToken: string;
}

const LinkSchema = new Schema<ILink>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    first_name: {
      type: String,
      trim: true,
      required: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    photo: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location_id: {
      type: String,
    },
    connections_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    links: [LinkSchema],
    is_online: {
      type: Boolean,
      default: false,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
    // New fields for recommendation system
    skills_summary: [{
      type: String,
      trim: true,
    }],
    experience_summary: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    search_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    profile_completeness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Comprehensive text search index
UserSchema.index({
  first_name: 'text',
  last_name: 'text',
  title: 'text',
  bio: 'text',
  skills_summary: 'text',
}, {
  weights: {
    first_name: 10,
    last_name: 8,
    title: 6,
    bio: 4,
    skills_summary: 5,
  },
  name: 'user_text_search'
});

// Performance indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });
UserSchema.index({ location_id: 1 });
UserSchema.index({ is_online: 1 });
UserSchema.index({ last_seen: -1 });
UserSchema.index({ created_at: -1 });
UserSchema.index({ search_score: -1 });
UserSchema.index({ profile_completeness: -1 });
UserSchema.index({ experience_summary: 1 });

// Compound indexes for complex queries
UserSchema.index({ 
  location_id: 1, 
  experience_summary: 1, 
  is_online: 1 
});

UserSchema.index({ 
  skills_summary: 1, 
  experience_summary: 1, 
  search_score: -1 
});

// Pre-save middleware to update derived fields
UserSchema.pre('save', async function(next) {
  if (this.isModified('first_name') || this.isModified('last_name') || 
      this.isModified('title') || this.isModified('bio')) {
    
    // Calculate profile completeness
    let completeness = 0;
    if (this.first_name) completeness += 20;
    if (this.last_name) completeness += 10;
    if (this.title) completeness += 20;
    if (this.bio) completeness += 15;
    if (this.photo) completeness += 10;
    if (this.location_id) completeness += 10;
    if (this.skills_summary && this.skills_summary.length > 0) completeness += 15;
    
    this.profile_completeness = Math.min(completeness, 100);
  }
  next();
});

export const UserModel = mongoose.model<IUser>('UserModel', UserSchema);
