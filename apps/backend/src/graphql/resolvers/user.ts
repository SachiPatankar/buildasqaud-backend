import { ApolloContext } from '../types';
import { CreateUserInput, UpdateUserInput, User } from '../../types/generated'; // Generated types from codegen

const resolvers = {
  Query: {
    // Query to load a user by their ID
    loadUserById: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<User | null> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.user.loadUserById(id, context.currentUser.id);
    },
  },

  Mutation: {
    // Mutation to create a new user
    createUser: async (
      _: any,
      { input }: { input: CreateUserInput },
      context: ApolloContext
    ): Promise<User> => {
      return context.dataSources.user.createUser(input);
    },

    // Mutation to update an existing user's profile
    updateUser: async (
      _: any,
      { input }: { input: UpdateUserInput },
      context: ApolloContext
    ): Promise<User> => {
      return context.dataSources.user.updateUser(input, context.currentUser.id);
    },

    // Mutation to delete a user
    deleteUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.user.deleteUser(userId);
    },

    // Mutation to change the user's password
    changePassword: async (
      _: any,
      {
        oldPassword,
        newPassword,
      }: { oldPassword: string; newPassword: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.user.changePassword(
        context.currentUser.id,
        oldPassword,
        newPassword
      );
    },
  },
};

export default resolvers;
