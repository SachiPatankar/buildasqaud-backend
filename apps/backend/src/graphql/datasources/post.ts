// graphql/datasources/post.ts
import { IPostDataSource } from './types';
import { ApplicationModel, PostModel, SavedPostModel, UserModel } from '@db';
import { ConnectionModel, ChatModel } from '@db';
import {
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  Post,
  PostSummary,
  PostDetails,
} from '../../types/generated';

// Only keep these imports for profile models:
import { UserSkillModel } from '@db';
import { ExperienceModel } from '@db';
import { ProjectModel } from '@db';

export default class PostDataSource implements IPostDataSource {
  loadPosts = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    // First, find the list of posts, populate user fields, and sort by created_at
    const posts = await PostModel.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean() // Lean makes it more efficient for subsequent operations
      .exec();

    // Retrieve the users who posted the posts to populate the necessary fields
    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .lean()
      .exec();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user; // Map each user by their UUID for easy access
      return acc;
    }, {});

    // Get the list of saved posts and applications for the current user
    console.log(current_user_id, 'current_user_id');
    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    // Map post_id to status for quick lookup
    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));
    // For backward compatibility, keep appliedPostIds as a Set
    const appliedPostIds = new Set(appliedPosts.map((ap) => ap.post_id));

    console.log('Saved Post IDs:', savedPostIds);
    console.log('Applied Post IDs:', appliedPostIds);

    // Map posts to include user data and check if they are saved or applied
    const postSummaries = posts.map((post) => {
      const user = userMap[post.posted_by]; // Get the user who posted the post

      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user.first_name,
        last_name: user.last_name,
        photo: user.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: false,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });

    return postSummaries;
  };

  loadPostById = async (
    postId: string,
    current_user_id: string
  ): Promise<PostDetails | null> => {
    // Fetch the post by ID and populate user fields
    const post = await PostModel.findById(postId).lean().exec();
    if (!post) {
      return null;
    }

    // Fetch the user who posted the post
    const user = await UserModel.findById(post.posted_by).lean().exec();
    if (!user) {
      return null;
    }

    // Check if the current user has saved or applied to the post
    const savedPost = await SavedPostModel.findOne({
      post_id: postId,
      user_id: current_user_id,
    })
      .lean()
      .exec();
    const appliedPost = await ApplicationModel.findOne({
      post_id: postId,
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    const isSaved = savedPost !== null;
    const isApplied = appliedPost?.status;

    // Add is_connection and chat_id for the post creator
    let is_connection = null;
    let chat_id = null;
    if (current_user_id && user._id.toString() !== current_user_id) {
      const connection = await ConnectionModel.findOne({
        $or: [
          { requester_user_id: current_user_id, addressee_user_id: user._id },
          { requester_user_id: user._id, addressee_user_id: current_user_id },
        ],
      });
      is_connection = connection ? connection.status : null;
      if (is_connection === 'accepted') {
        const chat = await ChatModel.findOne({
          participant_ids: { $all: [current_user_id, user._id.toString()] },
        });
        chat_id = chat ? chat._id : null;
      }
    }

    // Return the detailed post with additional information
    return {
      _id: post._id,
      title: post.title,
      description: post.description,
      posted_by: post.posted_by,
      first_name: user.first_name,
      last_name: user.last_name,
      photo: user.photo,
      tech_stack: post.tech_stack,
      work_mode: post.work_mode,
      experience_level: post.experience_level,
      location_id: post.location_id,
      status: post.status,
      views_count: post.views_count,
      applications_count: post.applications_count,
      requirements: post.requirements,
      project_phase: post.project_phase,
      project_type: post.project_type,
      is_saved: isSaved,
      is_applied: isApplied,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_connection,
      chat_id,
    };
  };

  loadPostByFilter = async (
    filter: PostFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    // Build MongoDB query from PostFilterInput
    const query: any = {};
    if (filter.status) {
      query.status = filter.status;
    }
    // Relaxed matching for project_type
    if (filter.project_type && filter.project_type.length > 0) {
      query.project_type = {
        $elemMatch: {
          $regex: filter.project_type.join('|'),
          $options: 'i',
        },
      };
    }
    // Strict matching for work_mode (enum)
    if (filter.work_mode && filter.work_mode.length > 0) {
      query.work_mode = { $in: filter.work_mode };
    }
    // Relaxed matching for tech_stack
    if (filter.tech_stack && filter.tech_stack.length > 0) {
      query.tech_stack = {
        $elemMatch: {
          $regex: filter.tech_stack.join('|'),
          $options: 'i',
        },
      };
    }
    // Strict matching for experience_level (enum)
    if (filter.experience_level && filter.experience_level.length > 0) {
      query.experience_level = { $in: filter.experience_level };
    }
    // Relaxed matching for desired_roles
    if (filter.desired_roles && filter.desired_roles.length > 0) {
      query['requirements.desired_roles'] = {
        $elemMatch: {
          $regex: filter.desired_roles.join('|'),
          $options: 'i',
        },
      };
    }

    // Fetch the posts based on the constructed query and populate user fields
    const posts = await PostModel.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .lean()
      .exec();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    // Get saved and applied post IDs for the current user
    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));
    const appliedPostIds = new Set(appliedPosts.map((ap) => ap.post_id));

    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    const postSummaries = posts.map((post) => {
      const user = userMap[post.posted_by];

      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user.first_name,
        last_name: user.last_name,
        photo: user.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: false,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });

    return postSummaries;
  };

  createPost = async (
    input: CreatePostInput,
    postedBy: string
  ): Promise<Post> => {
    const cleanedInput = { ...input };

    if (cleanedInput.work_mode === '') {
      cleanedInput.work_mode = undefined;
    }
    if (cleanedInput.experience_level === '') {
      cleanedInput.experience_level = undefined;
    }

    const newPost = new PostModel({ ...cleanedInput, posted_by: postedBy });
    return newPost.save();
  };
  updatePost = async (
    postId: string,
    input: UpdatePostInput
  ): Promise<Post | null> => {
    return PostModel.findByIdAndUpdate(postId, input, { new: true });
  };

  deletePost = async (postId: string): Promise<boolean> => {
    await PostModel.findByIdAndDelete(postId);
    return true;
  };

  incrementPostView = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { $inc: { views_count: 1 } },
      { new: true }
    );
  };

  closePost = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'closed' },
      { new: true }
    );
  };

  openPost = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'open' },
      { new: true }
    );
  };

  loadPostsByUserId = async (userId: string): Promise<PostSummary[]> => {
    // Find posts by the given userId
    const posts = await PostModel.find({ posted_by: userId })
      .sort({ created_at: -1 })
      .lean()
      .exec();

    // Retrieve the user who posted the posts
    const user = await UserModel.findById(userId).lean().exec();
    if (!user) return [];

    // Get the list of saved posts and applications for the user
    const savedPosts = await SavedPostModel.find({ user_id: userId })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: userId,
    })
      .lean()
      .exec();

    // Map post_id to status for quick lookup
    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));

    // Map posts to include user data and check if they are saved or applied
    const postSummaries = posts.map((post) => {
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user.first_name,
        last_name: user.last_name,
        photo: user.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: false,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });

    return postSummaries;
  };

  loadByRecommendation = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    // 1. Fetch user profile data
    const [skills, experiences, projects] = await Promise.all([
      UserSkillModel.find({ user_id: current_user_id }).lean().exec(),
      ExperienceModel.find({ user_id: current_user_id }).lean().exec(),
      ProjectModel.find({ user_id: current_user_id }).lean().exec(),
    ]);
    const skillNames = skills.map((s) => s.skill_name);
    const roles = experiences.map((e) => e.position);
    const techs = projects.flatMap((p) => p.technologies || []);
    // Optionally dedupe
    const userTechStack = Array.from(new Set([...skillNames, ...techs]));

    // Fallback: If user profile is incomplete, use loadPosts
    if (
      skillNames.length === 0 &&
      roles.length === 0 &&
      userTechStack.length === 0
    ) {
      return this.loadPosts(page, limit, current_user_id);
    }

    // 2. Build filter for posts
    const postQuery = {
      $or: [
        { 'requirements.desired_skills': { $in: skillNames } },
        { 'requirements.desired_roles': { $in: roles } },
        { tech_stack: { $in: userTechStack } },
      ],
    };

    // 3. Fetch posts
    const posts = await PostModel.find(postQuery).lean().exec();

    // 4. Score posts by matches
    function fuzzyIncludes(arr: string[], value: string): boolean {
      return arr.some(
        (item) =>
          item.toLowerCase().includes(value.toLowerCase()) ||
          value.toLowerCase().includes(item.toLowerCase())
      );
    }

    function scorePost(post) {
      let matchScore = 0;
      if (
        post.requirements?.desired_skills?.some((skill) =>
          fuzzyIncludes(skillNames, skill)
        )
      )
        matchScore++;
      if (
        post.requirements?.desired_roles?.some((role) =>
          fuzzyIncludes(roles, role)
        )
      )
        matchScore++;
      if (post.tech_stack?.some((tech) => fuzzyIncludes(userTechStack, tech)))
        matchScore++;

      // Recency score: 1 for newest, 0 for oldest (within a window)
      const now = Date.now();
      const postTime = new Date(post.created_at).getTime();
      const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days in ms
      const recencyScore = Math.max(0, 1 - (now - postTime) / maxAge);

      // Weights
      const matchWeight = 0.7;
      const recencyWeight = 0.3;

      // Combine scores
      return matchScore * matchWeight + recencyScore * recencyWeight;
    }
    const scoredPosts = posts
      .map((post) => ({ post, score: scorePost(post) }))
      .sort((a, b) => b.score - a.score);

    // 5. Pagination
    const paginated = scoredPosts.slice((page - 1) * limit, page * limit);
    const paginatedPosts = paginated.map(({ post }) => post);

    // 6. Populate user fields and saved/applied status (reuse logic from loadPosts)
    const userIds = paginatedPosts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .lean()
      .exec();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    })
      .lean()
      .exec();
    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));
    const appliedPostStatusMap = new Map(
      appliedPosts.map((ap) => [ap.post_id.toString(), ap.status])
    );

    return paginatedPosts.map((post) => {
      const user = userMap[post.posted_by];
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user?.first_name,
        last_name: user?.last_name,
        photo: user?.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: false,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });
  };

  searchProjects = async (search, current_user_id) => {
    let posts = [];
    if (search.length < 3) {
      // Use regex for prefix match
      posts = await PostModel.find({
        $or: [
          { title: { $regex: `^${search}`, $options: 'i' } },
          {
            tech_stack: { $elemMatch: { $regex: `^${search}`, $options: 'i' } },
          },
          {
            project_type: {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
          {
            'requirements.desired_skills': {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
          {
            'requirements.desired_roles': {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
        ],
      }).lean();
    } else {
      // Use $text for full-text search
      posts = await PostModel.aggregate([
        { $match: { $text: { $search: search } } },
        { $addFields: { score: { $meta: 'textScore' } } },
        { $sort: { score: -1 } },
      ]);
    }
    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    }).lean();
    const appliedPostStatusMap = new Map(
      appliedPosts.map((ap) => [ap.post_id.toString(), ap.status])
    );
    return posts.map((post) => {
      const user = userMap[post.posted_by];
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user?.first_name,
        last_name: user?.last_name,
        photo: user?.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: false,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });
  };
}
