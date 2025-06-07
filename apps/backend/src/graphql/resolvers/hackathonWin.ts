import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getAllHackathonWinsByProfileId: async (
      _: any,
      { profileId }: { profileId: string },
      { dataSources }: ApolloContext
    ) => dataSources.hackathonWin.getAllHackathonWinsByProfileId(profileId),

    getCurrentUserHackathonWins: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.hackathonWin.getCurrentUserHackathonWins(currentUser.id),
  },

  Mutation: {
    createHackathonWin: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.hackathonWin.createHackathonWin(input, currentUser.id),

    updateHackathonWinByID: async (
      _: any,
      {
        input,
      }: {
        input: {
          id: string;
          title?: string;
          rank?: string;
          description?: string;
        };
      },
      { dataSources, currentUser }: ApolloContext
    ) =>
      dataSources.hackathonWin.updateHackathonWinByID(
        input.id,
        input,
        currentUser.id
      ),

    deleteHackathonWinByID: async (
      _: any,
      { id }: { id: string },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.hackathonWin.deleteHackathonWinByID(id, currentUser.id),
  },
};

export default resolvers;
