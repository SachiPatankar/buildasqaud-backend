import { CreatePostInput, UpdatePostInput, PostFilterInput, Post } from '../../types/generated'; // Import generated types
import {SavedPost} from '../../types/generated'; 


export interface IDataSource {
  user: IUserDataSource;
  s3: IS3DataSource;
  post: IPostDataSource;         // Post data source
  savedPost: ISavedPostDataSource;  // Saved post data source
}

export interface IUserDataSource {
  getUsers(page?: number, limit?: number): Promise<any>;
  getUserById(userId: string): Promise<any>;
  updateUserPhoto(userId: string, photoUrl: string): Promise<any>;
  deletePhoto(userId: string): Promise<any>;
  updateUser(
    userId: string,
    data: { first_name?: string; last_name?: string }
  ): Promise<any>;
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean>;
}

export interface IS3DataSource {
  getPresignedUrl: (
    fileType: string,
    folder?: string
  ) => Promise<{
    upload_url: string;
    file_url: string;
  }>;
  deleteProfilePhoto: (photoUrl: string) => Promise<boolean>;
}

export interface IPostDataSource {
  loadPosts(page: number, limit: number): Promise<Post[]>;
  loadPostById(postId: string): Promise<Post | null>;     
  loadPostByFilter(filter: PostFilterInput): Promise<Post[]>; 
  createPost(input: CreatePostInput, postedBy: string): Promise<Post>; 
  updatePost(postId: string, input: UpdatePostInput): Promise<Post | null>; 
  deletePost(postId: string): Promise<boolean>; 
  incrementPostView(postId: string): Promise<Post>; 
  closePost(postId: string): Promise<Post>; 
}

export interface ISavedPostDataSource {
  getSavedPosts(userId: string): Promise<SavedPost[]>; 
  savePost(postId: string, userId: string): Promise<SavedPost>; 
  unsavePost(postId: string, userId: string): Promise<boolean>; 
}
