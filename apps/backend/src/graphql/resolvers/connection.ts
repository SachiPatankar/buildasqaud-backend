import { ApolloContext } from '../types';
import { Connection } from '../../types/generated'; // Import generated types

const resolvers = {
  Query: {
    loadConnectionsList: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Connection[]> => {
      if (userId)
        return context.dataSources.connection.loadConnectionsList(userId);
      return context.dataSources.connection.loadConnectionsList(
        context.currentUser.id
      );
    },
    loadPendingFriendRequests: async (
      _: any,
      __: any,
      context: ApolloContext
    ): Promise<Connection[]> => {
      return context.dataSources.connection.loadPendingFriendRequests(
        context.currentUser.id
      );
    },
    loadSentFriendRequests: async (
      _: any,
      __: any,
      context: ApolloContext
    ): Promise<Connection[]> => {
      return context.dataSources.connection.loadSentFriendRequests(
        context.currentUser.id
      );
    },
    checkConnectionStatus: async (
      _: any,
      { addresseeUserId }: { addresseeUserId: string },
      context: ApolloContext
    ): Promise<string> => {
      return context.dataSources.connection.checkConnectionStatus(
        context.currentUser.id,
        addresseeUserId
      );
    },
  },

  Mutation: {
    sendFriendReq: async (
      _: any,
      {
        addresseeUserId,
        message,
      }: { addresseeUserId: string; message: string },
      context: ApolloContext
    ): Promise<Connection> => {
      return context.dataSources.connection.sendFriendReq(
        context.currentUser.id,
        addresseeUserId,
        message
      );
    },
    acceptFriendReq: async (
      _: any,
      { connectionId }: { connectionId: string },
      context: ApolloContext
    ): Promise<Connection> => {
      return context.dataSources.connection.acceptFriendReq(connectionId);
    },
    declineFriendReq: async (
      _: any,
      { connectionId }: { connectionId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.connection.declineFriendReq(connectionId);
    },
    blockUser: async (
      _: any,
      { addresseeUserId }: { addresseeUserId: string },
      context: ApolloContext
    ): Promise<Connection> => {
      return context.dataSources.connection.blockUser(
        context.currentUser.id,
        addresseeUserId
      );
    },
    removeConnection: async (
      _: any,
      { connectionId }: { connectionId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.connection.removeConnection(connectionId);
    },
  },
};

export default resolvers;
