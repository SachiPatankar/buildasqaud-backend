import { UserModel } from '@db';
import { ApolloContext } from '../types';

const resolvers = {
  Mutation: {
    // — update first_name & last_name —
    updateUser: async (
      _: any,
      { input }: { input: { first_name?: string; last_name?: string } },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.user.updateUser(currentUser.id, input),

    // — change password —
    changePassword: async (
      _: any,
      {
        oldPassword,
        newPassword,
      }: { oldPassword: string; newPassword: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      await dataSources.user.changePassword(
        currentUser.id,
        oldPassword,
        newPassword
      );
      return true;
    },

    updateUserPhoto: async (
      _: any,
      { photoUrl }: { photoUrl: string },
      { dataSources, currentUser }: ApolloContext
    ) => dataSources.user.updateUserPhoto(currentUser.id, photoUrl),

    deletePhoto: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => {
      // atomically unset & get old URL
      const before = await UserModel.findByIdAndUpdate(
        currentUser.id,
        { $unset: { photo: 1 } },
        { new: false }
      );
      if (before?.photo) {
        await dataSources.s3.deleteProfilePhoto(before.photo);
      }
      return { _id: currentUser.id };
    },
  },
};

export default resolvers;
