import { ApolloContext } from '../types';

export default {
  Mutation: {
    sendFriendRequest: async (
      _: any,
      { toUserId }: { toUserId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.friend.sendRequest(currentUser.id, toUserId);
    },

    respondToRequest: async (
      _: any,
      { requestId, accept }: { requestId: string; accept: boolean },
      { dataSources, currentUser }
    ) => {
      const result = await dataSources.friend.respondToRequest(
        requestId,
        accept,
        currentUser.id
      );

      if (accept && result) {
        await dataSources.chat.createChat([result.friend_id], currentUser.id);
      }

      return result;
    },

    cancelFriendRequest: async (
      _: any,
      { requestId }: { requestId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.friend.cancelRequest(requestId, currentUser.id);
    },

    removeFriend: async (
      _: any,
      { friendshipId }: { friendshipId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.friend.removeFriend(friendshipId, currentUser.id);
    },
  },
};
