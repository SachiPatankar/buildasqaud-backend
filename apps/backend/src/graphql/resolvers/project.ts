import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getAllProjectsByProfileId: async (
      _: any,
      { profileId }: { profileId: string },
      { dataSources }: ApolloContext
    ) => dataSources.project.getAllProjectsByProfileId(profileId),

    getCurrentUserProjects: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.project.getCurrentUserProjects(currentUser.id),
  },

  Mutation: {
    createProject: async (
      _: any,
      { input }: any,
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.project.createProject(input, currentUser.id),

    updateProjectByID: async (
      _: any,
      {
        input,
      }: {
        input: {
          id: string;
          title?: string;
          description?: string;
          link?: string;
        };
      },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.project.updateProjectByID(input.id, input, currentUser.id),

    deleteProjectByID: async (
      _: any,
      { id }: { id: string },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.project.deleteProjectByID(id, currentUser.id),
  },
};

export default resolvers;
