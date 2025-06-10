// graphql/datasources/savedPost.ts
import { ISavedPostDataSource } from './types';
import { SavedPostModel } from '@db';
import { SavedPost } from '../../types/generated';

export default class SavedPostDataSource implements ISavedPostDataSource {
  async getSavedPosts(userId: string): Promise<SavedPost[]> {
    return SavedPostModel.find({ user_id: userId });
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
