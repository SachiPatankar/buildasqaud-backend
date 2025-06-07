import { ApolloContext } from '../types';

const resolvers = {
  Query: {
    getPresignedUrl: async (
      _: any,
      { fileType, folder }: { fileType: string; folder?: string },
      { dataSources }: ApolloContext
    ) => {
      return dataSources.s3.getPresignedUrl(fileType, folder);
    },
  },
  Mutation: {
    deleteProfilePhoto: async (
      _: any,
      { photoUrl }: { photoUrl: string },
      { dataSources }: ApolloContext
    ) => {
      return dataSources.s3.deleteProfilePhoto(photoUrl);
    },
  },
};
export default resolvers;
