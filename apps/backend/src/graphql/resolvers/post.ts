// graphql/resolvers/post.ts
import { ApolloContext } from '../types';
import {
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  SavedPost,
  PostSummary,
  PostDetails,
} from '../../types/generated';
const resolvers = {
  Query: {
    loadPosts: async (
      _: any,
      { page = 1, limit = 10 }: { page: number; limit: number },
      context: ApolloContext
    ): Promise<PostSummary[]> => {
      return context.dataSources.post.loadPosts(
        page,
        limit,
        context.currentUser.id
      );
    },
    loadPostById: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<PostDetails | null> => {
      return context.dataSources.post.loadPostById(
        postId,
        context.currentUser.id
      );
    },
    loadPostByFilter: async (
      _: any,
      { filter }: { filter: PostFilterInput },
      context: ApolloContext
    ): Promise<PostSummary[]> => {
      return context.dataSources.post.loadPostByFilter(
        filter,
        context.currentUser.id
      );
    },
    getSavedPosts: async (
      _: any,
      context: ApolloContext
    ): Promise<SavedPost[]> => {
      return context.dataSources.savedPost.getSavedPosts(
        context.currentUser.id
      );
    },
    loadPostsByUserId: async (
      _: any,
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<PostSummary[]> => {
      const resolvedUserId = userId || context.currentUser.id;
      return context.dataSources.post.loadPostsByUserId(resolvedUserId);
    },
  },

  Mutation: {
    createPost: async (
      _: any,
      { input }: { input: CreatePostInput },
      context: ApolloContext
    ): Promise<Post> => {
      return context.dataSources.post.createPost(input, context.currentUser.id);
    },
    updatePost: async (
      _: any,
      { postId, input }: { postId: string; input: UpdatePostInput },
      context: ApolloContext
    ): Promise<Post | null> => {
      return context.dataSources.post.updatePost(postId, input);
    },
    deletePost: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.post.deletePost(postId);
    },
    incrementPostView: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<Post> => {
      return context.dataSources.post.incrementPostView(postId);
    },
    savePost: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<SavedPost> => {
      return context.dataSources.savedPost.savePost(
        postId,
        context.currentUser.id
      );
    },
    unsavePost: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.savedPost.unsavePost(
        postId,
        context.currentUser.id
      );
    },
    closePost: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<Post> => {
      return context.dataSources.post.closePost(postId);
    },
    openPost: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<Post> => {
      return context.dataSources.post.openPost(postId);
    },
  },
};

export default resolvers;
