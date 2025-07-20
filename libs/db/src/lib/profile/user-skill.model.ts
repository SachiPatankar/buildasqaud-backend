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
  // New fields for recommendation system
  skill_score?: number; // Calculated score based on proficiency and experience
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
    // New field for recommendation system
    skill_score: {
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

// Enhanced text search index
UserSkillSchema.index({ skill_name: 'text' }, {
  weights: {
    skill_name: 10,
  },
  name: 'skill_text_search'
});

// Performance indexes for common queries
UserSkillSchema.index({ user_id: 1 });
UserSkillSchema.index({ skill_name: 1 });
UserSkillSchema.index({ proficiency_level: 1 });
UserSkillSchema.index({ is_top: 1 });
UserSkillSchema.index({ skill_score: -1 });
UserSkillSchema.index({ order: 1 });

// Compound indexes for complex queries
UserSkillSchema.index({ 
  user_id: 1, 
  is_top: 1, 
  order: 1 
});

UserSkillSchema.index({ 
  skill_name: 1, 
  proficiency_level: 1, 
  skill_score: -1 
});

UserSkillSchema.index({ 
  user_id: 1, 
  skill_score: -1 
});

// Pre-save middleware to calculate skill score
UserSkillSchema.pre('save', function(next) {
  if (this.isModified('proficiency_level') || this.isModified('years_experience')) {
    // Calculate skill score based on proficiency and experience
    const proficiencyScores = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };
    
    const baseScore = proficiencyScores[this.proficiency_level] || 1;
    const experienceBonus = Math.min((this.years_experience || 0) * 0.2, 2);
    
    this.skill_score = baseScore + experienceBonus;
  }
  next();
});

export const UserSkillModel = mongoose.model<IUserSkill>(
  'UserSkillModel',
  UserSkillSchema
);
