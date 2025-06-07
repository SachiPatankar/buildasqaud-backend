import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getPeople: async (
      _: any,
      { page, limit }: any,
      { dataSources }: ApolloContext
    ) => dataSources.people.getPeopleWithProfile(page, limit),
  },
};

export default resolvers;
