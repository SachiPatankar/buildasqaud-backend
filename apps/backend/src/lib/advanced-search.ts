import { UserModel, PostModel, UserSkillModel } from '@db';
import { User, Post } from '../types/generated';

export interface SearchFilters {
  query?: string;
  location_id?: string;
  experience_level?: string;
  skills?: string[];
  project_type?: string;
  work_mode?: string;
  status?: string;
  date_range?: {
    start?: Date;
    end?: Date;
  };
  sort_by?: 'relevance' | 'date' | 'popularity' | 'match_score';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export class AdvancedSearch {
  /**
   * Advanced user search with multiple filters
   */
  static async searchUsers(
    filters: SearchFilters = {}
  ): Promise<SearchResult<User>> {
    try {
      const limit = filters.limit || 20;
      const page = filters.page || 0;
      const skip = page * limit;

      // Build query
      const query: any = {};
      const sortOptions: any = {};

      // Text search
      if (filters.query) {
        query.$text = { $search: filters.query };
      }

      // Location filter
      if (filters.location_id) {
        query.location_id = filters.location_id;
      }

      // Experience level filter
      if (filters.experience_level) {
        query.experience_summary = filters.experience_level;
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        query.skills_summary = { $in: filters.skills };
      }

      // Online status filter
      if (filters.status === 'online') {
        query.is_online = true;
      }

      // Date range filter
      if (filters.date_range) {
        query.created_at = {};
        if (filters.date_range.start) {
          query.created_at.$gte = filters.date_range.start;
        }
        if (filters.date_range.end) {
          query.created_at.$lte = filters.date_range.end;
        }
      }

      // Sort options
      switch (filters.sort_by) {
        case 'date':
          sortOptions.created_at = filters.sort_order === 'asc' ? 1 : -1;
          break;
        case 'popularity':
          sortOptions.search_score = filters.sort_order === 'asc' ? 1 : -1;
          break;
        case 'match_score':
          sortOptions.profile_completeness = filters.sort_order === 'asc' ? 1 : -1;
          break;
        default:
          // Relevance sorting (text score + profile completeness)
          if (filters.query) {
            sortOptions.score = { $meta: 'textScore' };
          }
          sortOptions.profile_completeness = -1;
      }

      // Get total count
      const total = await UserModel.countDocuments(query);

      // Get users with pagination
      const users = await UserModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        data: users,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit) - 1,
        has_prev: page > 0
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 20,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  /**
   * Advanced post search with multiple filters
   */
  static async searchPosts(
    filters: SearchFilters = {}
  ): Promise<SearchResult<Post>> {
    try {
      const limit = filters.limit || 20;
      const page = filters.page || 0;
      const skip = page * limit;

      // Build query
      const query: any = {};
      const sortOptions: any = {};

      // Text search
      if (filters.query) {
        query.$text = { $search: filters.query };
      }

      // Status filter
      if (filters.status) {
        query.status = filters.status;
      } else {
        query.status = 'open'; // Default to open posts
      }

      // Location filter
      if (filters.location_id) {
        query.location_id = filters.location_id;
      }

      // Experience level filter
      if (filters.experience_level) {
        query.experience_level = filters.experience_level;
      }

      // Project type filter
      if (filters.project_type) {
        query.project_type = filters.project_type;
      }

      // Work mode filter
      if (filters.work_mode) {
        query.work_mode = filters.work_mode;
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        query.$or = [
          { tech_stack: { $in: filters.skills } },
          { 'requirements.desired_skills': { $in: filters.skills } }
        ];
      }

      // Date range filter
      if (filters.date_range) {
        query.created_at = {};
        if (filters.date_range.start) {
          query.created_at.$gte = filters.date_range.start;
        }
        if (filters.date_range.end) {
          query.created_at.$lte = filters.date_range.end;
        }
      }

      // Sort options
      switch (filters.sort_by) {
        case 'date':
          sortOptions.created_at = filters.sort_order === 'asc' ? 1 : -1;
          break;
        case 'popularity':
          sortOptions.popularity_score = filters.sort_order === 'asc' ? 1 : -1;
          break;
        case 'match_score':
          sortOptions.applications_count = filters.sort_order === 'asc' ? 1 : -1;
          break;
        default:
          // Relevance sorting (text score + popularity)
          if (filters.query) {
            sortOptions.score = { $meta: 'textScore' };
          }
          sortOptions.popularity_score = -1;
      }

      // Get total count
      const total = await PostModel.countDocuments(query);

      // Get posts with pagination
      const posts = await PostModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        data: posts,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit) - 1,
        has_prev: page > 0
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      return {
        data: [],
        total: 0,
        page: 0,
        limit: 20,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  /**
   * Fuzzy search for skills with autocomplete
   */
  static async searchSkills(query: string, limit = 10): Promise<string[]> {
    try {
      const skills = await UserSkillModel.find({
        skill_name: { $regex: query, $options: 'i' }
      })
      .distinct('skill_name')
      .limit(limit)
      .lean();

      return skills;
    } catch (error) {
      console.error('Error searching skills:', error);
      return [];
    }
  }

  /**
   * Get search suggestions based on popular searches
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Enhanced suggestions with AI and cybersecurity focus
      const suggestions = [
        // AI & Machine Learning
        'AI Engineer',
        'Machine Learning Engineer',
        'Data Scientist',
        'MLOps Engineer',
        'AI Research Engineer',
        'Deep Learning Specialist',
        'Computer Vision Engineer',
        'NLP Engineer',
        'AI Product Manager',
        'Prompt Engineer',
        
        // Cybersecurity
        'Security Engineer',
        'Cybersecurity Analyst',
        'Penetration Tester',
        'Security Architect',
        'Threat Intelligence Analyst',
        'SOC Analyst',
        'Security Consultant',
        'Incident Response Specialist',
        'Vulnerability Researcher',
        'Security Operations Engineer',
        
        // Full Stack & Backend
        'Full Stack Engineer',
        'Backend Developer',
        'DevOps Engineer',
        'Site Reliability Engineer',
        'Cloud Engineer',
        'Systems Engineer',
        'Platform Engineer',
        
        // Frontend & UI/UX
        'Frontend Developer',
        'UI/UX Designer',
        'React Developer',
        'Mobile App Developer',
        'Web Developer',
        
        // Data & Analytics
        'Data Engineer',
        'Business Intelligence Analyst',
        'Data Analyst',
        'Analytics Engineer',
        'Data Architect',
        
        // Emerging Tech
        'Blockchain Developer',
        'IoT Engineer',
        'AR/VR Developer',
        'Robotics Engineer',
        'Quantum Computing Researcher'
      ];

      return suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8); // Increased to show more relevant suggestions
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get trending searches
   */
  static async getTrendingSearches(): Promise<string[]> {
    try {
      // Enhanced trending searches with AI and cybersecurity focus
      return [
        // AI & Machine Learning
        'AI Engineer',
        'Machine Learning',
        'Deep Learning',
        'Computer Vision',
        'Natural Language Processing',
        'LLM',
        'Generative AI',
        'Prompt Engineering',
        'MLOps',
        'AI Research',
        
        // Cybersecurity
        'Cybersecurity',
        'Penetration Testing',
        'Threat Intelligence',
        'Security Operations',
        'Incident Response',
        'Vulnerability Assessment',
        'Security Architecture',
        'SOC Analyst',
        'Zero Trust',
        'Security Automation',
        
        // Cloud & DevOps
        'AWS',
        'Docker',
        'Kubernetes',
        'Terraform',
        'CI/CD',
        'Microservices',
        'Serverless',
        'Cloud Native',
        
        // Programming Languages & Frameworks
        'Python',
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Rust',
        'Go',
        'Kotlin',
        
        // Data & Analytics
        'Data Science',
        'Big Data',
        'Apache Spark',
        'Data Engineering',
        'Business Intelligence',
        
        // Emerging Technologies
        'Blockchain',
        'IoT',
        'Edge Computing',
        'Quantum Computing',
        '5G Networks'
      ];
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  /**
   * Get search analytics (for admin/monitoring)
   */
  static async getSearchAnalytics(): Promise<any> {
    try {
      const totalUsers = await UserModel.countDocuments();
      const totalPosts = await PostModel.countDocuments({ status: 'open' });
      const totalSkills = await UserSkillModel.distinct('skill_name').then(skills => skills.length);

      return {
        total_users: totalUsers,
        total_posts: totalPosts,
        total_skills: totalSkills,
        search_indexes: {
          users: 'user_text_search',
          posts: 'post_text_search',
          skills: 'skill_text_search'
        }
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {};
    }
  }
} 