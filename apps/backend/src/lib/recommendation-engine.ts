import { UserModel, PostModel, UserSkillModel } from '@db';
import { User, Post } from '../types/generated';

export interface RecommendationFilters {
  location_id?: string;
  experience_level?: string;
  skills?: string[];
  project_type?: string;
  work_mode?: string;
  limit?: number;
  page?: number;
}

export interface UserRecommendation {
  user: User;
  match_score: number;
  matching_skills: string[];
  reasons: string[];
}

export interface PostRecommendation {
  post: Post;
  match_score: number;
  matching_skills: string[];
  reasons: string[];
}

export class RecommendationEngine {
  /**
   * Get personalized post recommendations for a user
   */
  static async getPostRecommendations(
    userId: string,
    filters: RecommendationFilters = {}
  ): Promise<PostRecommendation[]> {
    try {
      // Get user's skills and preferences
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      const userSkills = await UserSkillModel.find({
        user_id: userId,
        is_top: true
      }).sort({ skill_score: -1 });

      const userSkillNames = userSkills.map(skill => skill.skill_name.toLowerCase());
      const userExperienceLevel = user.experience_summary || 'intermediate';

      // Build query with filters
      const query: any = { status: 'open' };

      if (filters.location_id) query.location_id = filters.location_id;
      if (filters.experience_level) query.experience_level = filters.experience_level;
      if (filters.project_type) query.project_type = filters.project_type;
      if (filters.work_mode) query.work_mode = filters.work_mode;

      // Get posts with pagination
      const limit = filters.limit || 20;
      const skip = (filters.page || 0) * limit;

      const posts = await PostModel.find(query)
        .sort({ popularity_score: -1, created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate match scores for each post
      const recommendations: PostRecommendation[] = [];

      for (const post of posts) {
        const matchScore = this.calculatePostMatchScore(
          post,
          userSkillNames,
          userExperienceLevel,
          user.location_id
        );

        const matchingSkills = this.findMatchingSkills(
          [...(post.tech_stack || []), ...(post.requirements?.desired_skills || [])],
          userSkillNames
        );

        const reasons = this.generateMatchReasons(
          post,
          matchingSkills,
          userExperienceLevel,
          user.location_id
        );
        console.log(matchScore, matchingSkills, reasons);

        recommendations.push({
          post,
          match_score: matchScore,
          matching_skills: matchingSkills,
          reasons
        });
        console.log('recommendations', recommendations);
      }

      // Sort by match score
      return recommendations.sort((a, b) => b.match_score - a.match_score);
    } catch (error) {
      console.error('Error getting post recommendations:', error);
      return [];
    }
  }

  /**
   * Get personalized user recommendations for a post
   */
  static async getUserRecommendations(
    postId: string,
    filters: RecommendationFilters = {}
  ): Promise<UserRecommendation[]> {
    try {
      // Get post details
      const post = await PostModel.findById(postId);
      if (!post) throw new Error('Post not found');

      const requiredSkills = [
        ...(post.tech_stack || []),
        ...(post.requirements?.desired_skills || [])
      ].map(skill => skill.toLowerCase());

      // Build query with filters
      const query: any = {};

      if (filters.location_id) query.location_id = filters.location_id;
      if (filters.experience_level) query.experience_summary = filters.experience_level;

      // Get users with pagination
      const limit = filters.limit || 20;
      const skip = (filters.page || 0) * limit;

      const users = await UserModel.find(query)
        .sort({ profile_completeness: -1, search_score: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate match scores for each user
      const recommendations: UserRecommendation[] = [];

      for (const user of users) {
        const userSkills = await UserSkillModel.find({
          user_id: user._id,
          is_top: true
        }).sort({ skill_score: -1 });

        const userSkillNames = userSkills.map(skill => skill.skill_name.toLowerCase());
        const userExperienceLevel = user.experience_summary || 'intermediate';

        const matchScore = this.calculateUserMatchScore(
          user,
          userSkillNames,
          userExperienceLevel,
          requiredSkills,
          post.experience_level || 'any',
          post.location_id
        );

        const matchingSkills = this.findMatchingSkills(
          requiredSkills,
          userSkillNames
        );

        const reasons = this.generateUserMatchReasons(
          user,
          matchingSkills,
          userExperienceLevel,
          post
        );

        recommendations.push({
          user,
          match_score: matchScore,
          matching_skills: matchingSkills,
          reasons
        });
      }

      // Sort by match score
      return recommendations.sort((a, b) => b.match_score - a.match_score);
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate match score for a post
   */
  private static calculatePostMatchScore(
    post: any,
    userSkills: string[],
    userExperienceLevel: string,
    userLocation?: string
  ): number {
    let score = 0;

    // Skill matching (40% weight)
    const postSkills = [
      ...(post.tech_stack || []),
      ...(post.requirements?.desired_skills || [])
    ].map(skill => skill.toLowerCase());

    const matchingSkills = this.findMatchingSkills(postSkills, userSkills);
    const skillMatchRatio = matchingSkills.length / Math.max(postSkills.length, 1);
    score += skillMatchRatio * 40;

    // Experience level matching (25% weight)
    if (post.experience_level === 'any' || post.experience_level === userExperienceLevel) {
      score += 25;
    } else {
      const experienceScores = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
      const postLevel = experienceScores[post.experience_level] || 2;
      const userLevel = experienceScores[userExperienceLevel] || 2;
      const levelDiff = Math.abs(postLevel - userLevel);
      score += Math.max(0, 25 - (levelDiff * 5));
    }

    // Location matching (15% weight)
    if (userLocation && post.location_id === userLocation) {
      score += 15;
    }

    // Recency bonus (10% weight)
    const daysSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 10 - (daysSinceCreation / 3));
    score += recencyBonus;

    // Popularity bonus (10% weight)
    const popularityBonus = Math.min(10, (post.popularity_score || 0) / 10);
    score += popularityBonus;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate match score for a user
   */
  private static calculateUserMatchScore(
    user: any,
    userSkills: string[],
    userExperienceLevel: string,
    requiredSkills: string[],
    requiredExperienceLevel: string,
    postLocation?: string
  ): number {
    let score = 0;

    // Skill matching (40% weight)
    const matchingSkills = this.findMatchingSkills(requiredSkills, userSkills);
    const skillMatchRatio = matchingSkills.length / Math.max(requiredSkills.length, 1);
    score += skillMatchRatio * 40;

    // Experience level matching (25% weight)
    if (requiredExperienceLevel === 'any' || requiredExperienceLevel === userExperienceLevel) {
      score += 25;
    } else {
      const experienceScores = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
      const requiredLevel = experienceScores[requiredExperienceLevel] || 2;
      const userLevel = experienceScores[userExperienceLevel] || 2;
      const levelDiff = Math.abs(requiredLevel - userLevel);
      score += Math.max(0, 25 - (levelDiff * 5));
    }

    // Location matching (15% weight)
    if (postLocation && user.location_id === postLocation) {
      score += 15;
    }

    // Profile completeness bonus (10% weight)
    score += (user.profile_completeness || 0) * 0.1;

    // Online status bonus (10% weight)
    if (user.is_online) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Find matching skills between two arrays
   */
  private static findMatchingSkills(
    requiredSkills: string[],
    userSkills: string[]
  ): string[] {
    const matches: string[] = [];

    // Enhanced skill matching with AI and cybersecurity focus
    const skillAliases: Record<string, string[]> = {
      // AI & ML Skills
      'machine learning': ['ml', 'ai', 'artificial intelligence', 'deep learning'],
      'deep learning': ['dl', 'neural networks', 'ai', 'machine learning'],
      'computer vision': ['cv', 'image processing', 'opencv', 'computer vision'],
      'natural language processing': ['nlp', 'text processing', 'language models'],
      'data science': ['ds', 'analytics', 'statistics', 'machine learning'],
      'tensorflow': ['tf', 'deep learning', 'neural networks'],
      'pytorch': ['torch', 'deep learning', 'neural networks'],
      'scikit-learn': ['sklearn', 'machine learning', 'ml'],

      // Cybersecurity Skills
      'penetration testing': ['pentesting', 'ethical hacking', 'security testing'],
      'threat intelligence': ['threat intel', 'security intelligence', 'threat analysis'],
      'incident response': ['ir', 'security incident', 'breach response'],
      'vulnerability assessment': ['vuln assessment', 'security assessment', 'penetration testing'],
      'security operations': ['soc', 'security operations center', 'security monitoring'],
      'network security': ['netsec', 'network defense', 'firewall'],
      'application security': ['appsec', 'web security', 'secure coding'],
      'cloud security': ['aws security', 'azure security', 'gcp security'],

      // Programming Languages
      'python': ['py', 'python3', 'python programming'],
      'javascript': ['js', 'node.js', 'typescript'],
      'typescript': ['ts', 'javascript', 'js'],
      'java': ['java programming', 'spring', 'android'],
      'c++': ['cpp', 'c plus plus', 'c++ programming'],
      'rust': ['rust programming', 'systems programming'],
      'go': ['golang', 'go programming'],

      // Frameworks & Tools
      'react': ['react.js', 'reactjs', 'frontend'],
      'node.js': ['nodejs', 'node', 'backend'],
      'docker': ['containerization', 'containers', 'kubernetes'],
      'kubernetes': ['k8s', 'container orchestration', 'docker'],
      'aws': ['amazon web services', 'cloud computing', 'aws services'],
      'terraform': ['iac', 'infrastructure as code', 'devops'],
      'jenkins': ['ci/cd', 'continuous integration', 'automation']
    };

    for (const requiredSkill of requiredSkills) {
      const normalizedRequiredSkill = requiredSkill.toLowerCase();

      // Direct match
      if (userSkills.some(skill => skill.toLowerCase().includes(normalizedRequiredSkill))) {
        matches.push(requiredSkill);
        continue;
      }

      // Check aliases
      const aliases = skillAliases[normalizedRequiredSkill] || [];
      for (const userSkill of userSkills) {
        const normalizedUserSkill = userSkill.toLowerCase();

        // Check if user skill matches any alias
        if (aliases.some(alias => normalizedUserSkill.includes(alias))) {
          matches.push(requiredSkill);
          break;
        }

        // Check if any alias matches user skill
        if (skillAliases[normalizedUserSkill]) {
          const userAliases = skillAliases[normalizedUserSkill];
          if (userAliases.some(alias => normalizedRequiredSkill.includes(alias))) {
            matches.push(requiredSkill);
            break;
          }
        }
      }
    }

    return [...new Set(matches)];
  }

  /**
   * Generate reasons for post match
   */
  private static generateMatchReasons(
    post: any,
    matchingSkills: string[],
    userExperienceLevel: string,
    userLocation?: string
  ): string[] {
    const reasons: string[] = [];

    if (matchingSkills.length > 0) {
      reasons.push(`Matches ${matchingSkills.length} required skills`);
    }
    console.log('dsadad', post.experience_level, userExperienceLevel);
    if (post.experience_level === 'any' || post.experience_level === userExperienceLevel) {
      reasons.push('Experience level matches');
    }

    if (userLocation && post.location_id === userLocation) {
      reasons.push('Location matches');
    }

    if (post.popularity_score > 5) {
      reasons.push('Popular project');
    }

    const daysSinceCreation = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 7) {
      reasons.push('Recently posted');
    }

    return reasons;
  }

  /**
   * Generate reasons for user match
   */
  private static generateUserMatchReasons(
    user: any,
    matchingSkills: string[],
    userExperienceLevel: string,
    post: any
  ): string[] {
    const reasons: string[] = [];

    if (matchingSkills.length > 0) {
      reasons.push(`Has ${matchingSkills.length} required skills`);
    }

    console.log('dsadad', post.experience_level, userExperienceLevel);
    if (post.experience_level === 'any' || post.experience_level === userExperienceLevel) {
      reasons.push('Experience level matches');
    }

    if (post.location_id && user.location_id === post.location_id) {
      reasons.push('Location matches');
    }

    if (user.profile_completeness > 80) {
      reasons.push('Complete profile');
    }

    if (user.is_online) {
      reasons.push('Currently online');
    }

    return reasons;
  }

  /**
   * Update user's skills summary for better search
   */
  static async updateUserSkillsSummary(userId: string): Promise<void> {
    try {
      const topSkills = await UserSkillModel.find({
        user_id: userId,
        is_top: true
      })
        .sort({ skill_score: -1 })
        .limit(5)
        .lean();

      const skillNames = topSkills.map(skill => skill.skill_name);

      await UserModel.findByIdAndUpdate(userId, {
        skills_summary: skillNames,
        experience_summary: this.calculateOverallExperienceLevel(topSkills)
      });
    } catch (error) {
      console.error('Error updating user skills summary:', error);
    }
  }

  /**
   * Calculate overall experience level from skills
   */
  private static calculateOverallExperienceLevel(skills: any[]): string {
    if (skills.length === 0) return 'beginner';

    const levelScores = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const totalScore = skills.reduce((sum, skill) => sum + (levelScores[skill.proficiency_level] || 1), 0);
    const averageScore = totalScore / skills.length;

    if (averageScore >= 3.5) return 'expert';
    if (averageScore >= 2.5) return 'advanced';
    if (averageScore >= 1.5) return 'intermediate';
    return 'beginner';
  }
} 