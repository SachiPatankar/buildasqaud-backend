import { ApolloContext } from '../types';
import {
  Connection,
} from '../../types/generated'; // Import generated types

const resolvers = {
  Query: {
    loadConnectionsList: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Connection[]> => {
      return context.dataSources.connection.loadConnectionsList(userId);
    },
    loadPendingFriendRequests: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Connection[]> => {
      return context.dataSources.connection.loadPendingFriendRequests(userId);
    },
    loadSentFriendRequests: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Connection[]> => {
      return context.dataSources.connection.loadSentFriendRequests(userId);
    },
    checkConnectionStatus: async (
      _: any,
      { requesterUserId, addresseeUserId }: { requesterUserId: string, addresseeUserId: string },
      context: ApolloContext
    ): Promise<string> => {
      return context.dataSources.connection.checkConnectionStatus(requesterUserId, addresseeUserId);
    },
  },

  Mutation: {
    sendFriendReq: async (
      _: any,
      { requesterUserId, addresseeUserId, message }: { requesterUserId: string, addresseeUserId: string, message: string },
      context: ApolloContext
    ): Promise<Connection> => {
      return context.dataSources.connection.sendFriendReq(requesterUserId, addresseeUserId, message);
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
      { requesterUserId, addresseeUserId }: { requesterUserId: string, addresseeUserId: string },
      context: ApolloContext
    ): Promise<Connection> => {
      return context.dataSources.connection.blockUser(requesterUserId, addresseeUserId);
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
