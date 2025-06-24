// graphql/datasources/post.ts
import { IPostDataSource } from './types';
import { ApplicationModel, PostModel, SavedPostModel, UserModel } from '@db';
import {
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  Post,
  PostSummary,
  PostDetails,
} from '../../types/generated';

export default class PostDataSource implements IPostDataSource {
  // async loadPosts(page: number, limit: number): Promise<Post[]> {
  //   return PostModel.find()
  //     .skip((page - 1) * limit)
  //     .limit(limit)
  //     .sort({ created_at: -1 });
  // }

  // async loadPostById(postId: string): Promise<Post | null> {
  //   return PostModel.findById(postId);
  // }

  // async loadPostByFilter(filter: PostFilterInput): Promise<Post[]> {
  //   return PostModel.find(filter).sort({ created_at: -1 });
  // }

  async loadPosts(
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> {
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
        is_saved: savedPostIds.has(post._id),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
    });

    return postSummaries;
  }

  async loadPostById(
    postId: string,
    current_user_id: string
  ): Promise<PostDetails | null> {
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
    };
  }

  async loadPostByFilter(
    filter: PostFilterInput,
    current_user_id: string
  ): Promise<PostSummary[]> {
    // Fetch the posts based on the filter and populate user fields
    const posts = await PostModel.find(filter)
      .sort({ created_at: -1 })
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
      status: 'accepted',
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
        is_saved: savedPostIds.has(post._id),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
    });

    return postSummaries;
  }

  async createPost(input: CreatePostInput, postedBy: string): Promise<Post> {
    const newPost = new PostModel({ ...input, posted_by: postedBy });
    return newPost.save();
  }

  async updatePost(
    postId: string,
    input: UpdatePostInput
  ): Promise<Post | null> {
    return PostModel.findByIdAndUpdate(postId, input, { new: true });
  }

  async deletePost(postId: string): Promise<boolean> {
    await PostModel.findByIdAndDelete(postId);
    return true;
  }

  async incrementPostView(postId: string): Promise<Post> {
    return PostModel.findByIdAndUpdate(
      postId,
      { $inc: { views_count: 1 } },
      { new: true }
    );
  }

  async closePost(postId: string): Promise<Post> {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'closed' },
      { new: true }
    );
  }

  async openPost(postId: string): Promise<Post> {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'open' },
      { new: true }
    );
  }

  async loadPostsByUserId(userId: string): Promise<PostSummary[]> {
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
        is_saved: savedPostIds.has(post._id),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
    });

    return postSummaries;
  }
}
