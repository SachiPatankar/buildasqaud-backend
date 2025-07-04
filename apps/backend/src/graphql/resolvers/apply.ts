import { ApolloContext } from '../types';
import {
  Application,
  ApplicationsByPostIdResponse,
  ApplicationsByUserIdResponse,
} from '../../types/generated';

const resolvers = {
  Query: {
    loadApplicationsByPostId: async (
      _: any,
      { postId }: { postId: string },
      context: ApolloContext
    ): Promise<ApplicationsByPostIdResponse[]> => {
      return context.dataSources.application.loadApplicationsByPostId(postId, context.currentUser?.id);
    },
    getApplicationsByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<ApplicationsByUserIdResponse[]> => {
      // Use context.currentUser.id to get the current user's ID instead of userId argument
      return context.dataSources.application.getApplicationsByUser(
        context.currentUser.id
      );
    },
  },

  Mutation: {
    applyToPost: async (
      _: any,
      { postId, message }: { postId: string; message: string },
      context: ApolloContext
    ): Promise<Application> => {
      // Use context.currentUser.id as the applicant_id
      return context.dataSources.application.applyToPost(
        postId,
        context.currentUser.id,
        message
      );
    },
    cancelApplyToPost: async (
      _: any,
      { applicationId }: { applicationId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.application.cancelApplyToPost(applicationId);
    },
    updateApplicationStatus: async (
      _: any,
      { applicationId, status }: { applicationId: string; status: string },
      context: ApolloContext
    ): Promise<Application> => {
      return context.dataSources.application.updateApplicationStatus(
        applicationId,
        status
      );
    },
  },
};

export default resolvers;
