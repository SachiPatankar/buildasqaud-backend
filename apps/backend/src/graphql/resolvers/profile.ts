import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getProfileById: async (
      _: any,
      { id }: { id: string },
      { dataSources }: ApolloContext
    ) => dataSources.profile.getProfileById(id),

    getCurrentUserProfile: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.profile.getCurrentUserProfile(currentUser.id),
  },

  Mutation: {
    updateCurrentUserProfile: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.profile.updateCurrentUserProfile(currentUser.id, input),
  },
};

export default resolvers;
