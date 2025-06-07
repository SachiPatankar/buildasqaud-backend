import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getAllExperiencesByProfileId: async (
      _: any,
      { profileId }: { profileId: string },
      { dataSources }: ApolloContext
    ) => dataSources.experience.getAllExperiencesByProfileId(profileId),

    getCurrentUserExperiences: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.experience.getCurrentUserExperiences(currentUser.id),
  },

  Mutation: {
    createExperience: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.experience.createExperience(input, currentUser.id),

    updateExperienceByID: async (
      _: any,
      {
        input,
      }: {
        input: {
          id: string;
          company?: string;
          position?: string;
          duration?: string;
          location_id?: string;
        };
      },
      { dataSources, currentUser }: ApolloContext
    ) =>
      dataSources.experience.updateExperienceByID(
        input.id,
        input,
        currentUser.id
      ),

    deleteExperienceByID: async (
      _: any,
      { id }: { id: string },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.experience.deleteExperienceByID(id, currentUser.id),
  },
};

export default resolvers;
