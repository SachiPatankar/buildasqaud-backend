// graphql/datasources/savedPost.ts
import { ISavedPostDataSource } from './types';
import { SavedPostModel, PostModel, UserModel, ApplicationModel } from '@db';
import { SavedPost, PostSummary } from '../../types/generated';

export default class SavedPostDataSource implements ISavedPostDataSource {
  async getSavedPosts(userId: string): Promise<PostSummary[]> {
    // Find all saved posts for the user
    const savedPosts = await SavedPostModel.find({ user_id: userId })
      .lean()
      .exec();
    const postIds = savedPosts.map((sp) => sp.post_id);

    // Find all posts that are saved
    const posts = await PostModel.find({ _id: { $in: postIds } })
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

    // Find all applications by the user for these posts
    const appliedPosts = await ApplicationModel.find({
      applicant_id: userId,
      post_id: { $in: postIds },
    })
      .lean()
      .exec();
    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    // Map to PostSummary
    const postSummaries: PostSummary[] = posts.map((post) => {
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
        is_saved: true,
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
    });
    return postSummaries;
  }

  async savePost(postId: string, userId: string): Promise<SavedPost> {
    const savedPost = new SavedPostModel({ user_id: userId, post_id: postId });
    return savedPost.save();
  }

  async unsavePost(postId: string, userId: string): Promise<boolean> {
    await SavedPostModel.findOneAndDelete({ user_id: userId, post_id: postId });
    return true;
  }
}
