import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getAllHackathons: async (
      _: any,
      { page, limit }: { page?: number; limit?: number },
      { dataSources }: ApolloContext
    ) => dataSources.hackathon.getAllHackathons(page, limit),
    getHackathonById: async (
      _: any,
      { id }: { id: string },
      { dataSources }: ApolloContext
    ) => dataSources.hackathon.getHackathonById(id),
  },

  Mutation: {
    createHackathon: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.hackathon.createHackathon(input, currentUser.id),

    updateHackathon: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: any
    ) => dataSources.hackathon.updateHackathon(input.id, input, currentUser.id),

    interested: async (
      _: any,
      { hackathonId }: { hackathonId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      await dataSources.interest.interested(hackathonId, currentUser.id);
      return dataSources.hackathon.getHackathonById(hackathonId);
    },

    uninterested: async (
      _: any,
      { hackathonId }: { hackathonId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      await dataSources.interest.uninterested(hackathonId, currentUser.id);
      return dataSources.hackathon.getHackathonById(hackathonId);
    },
  },
};

export default resolvers;
