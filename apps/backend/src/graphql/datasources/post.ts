// graphql/datasources/post.ts
import { IPostDataSource } from './types';
import { PostModel } from '@db';
import {
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  Post,
} from '../../types/generated';

export default class PostDataSource implements IPostDataSource {
  async loadPosts(page: number, limit: number): Promise<Post[]> {
    return PostModel.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });
  }

  async loadPostById(postId: string): Promise<Post | null> {
    return PostModel.findById(postId);
  }

  async loadPostByFilter(filter: PostFilterInput): Promise<Post[]> {
    return PostModel.find(filter).sort({ created_at: -1 });
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
}
