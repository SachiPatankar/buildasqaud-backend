import { getIO } from '@socket';
import { ApolloContext } from '../types';

export default {
  Query: {
    loadPreviousMessages: async (
      _: any,
      {
        chatId,
        limit,
        before,
      }: { chatId: string; limit: number; before?: Date },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.chat.loadPreviousMessages(
        chatId,
        currentUser.id,
        limit,
        before
      );
    },

    oneToOneChat: async (
      _: any,
      { otherUserId }: { otherUserId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.chat.getChatByUserIds(currentUser.id, otherUserId);
    },

    getAllChatsForUser: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.chat.getAllChatsForUser(currentUser.id);
    },

    getAllGroupsForUser: async (
      _: any,
      __: any,
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.chat.getAllGroupsForUser(currentUser.id);
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      { chatId, content }: { chatId: string; content: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      const msg = await dataSources.chat.sendMessage(
        chatId,
        currentUser.id,
        content
      );
      getIO().to(chatId).emit('newMessage', msg);
      return msg;
    },

    deleteMessageForEveryone: async (
      _: any,
      { messageId }: { messageId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      await dataSources.chat.deleteMessageForEveryone(
        messageId,
        currentUser.id
      );
      getIO().to(messageId).emit('messageDeleted', { messageId });
      return true;
    },

    deleteMessageForMe: async (
      _: any,
      { messageId }: { messageId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      return dataSources.chat.deleteMessageForMe(messageId, currentUser.id);
    },

    createChat: async (
      _: any,
      { participantIds }: { participantIds: string[] },
      { dataSources, currentUser }: ApolloContext
    ) => {
      const chat = await dataSources.chat.createChat(
        participantIds,
        currentUser.id
      );

      if ('participant_ids' in chat) {
        chat.participant_ids.forEach((uid: string) => {
          getIO().to(uid).emit('chatCreated', chat);
        });
      } else {
        getIO().to(chat._id).emit('chatCreated', chat);
      }

      return chat;
    },

    addToChat: async (
      _: any,
      { chatId, userId }: { chatId: string; userId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      const chat = await dataSources.chat.addToGroup(
        chatId,
        userId,
        currentUser.id
      );
      getIO().to(chatId).emit('userAdded', { chatId, userId });
      return chat;
    },

    removeFromChat: async (
      _: any,
      { chatId, userId }: { chatId: string; userId: string },
      { dataSources, currentUser }: ApolloContext
    ) => {
      const chat = await dataSources.chat.removeFromGroup(
        chatId,
        userId,
        currentUser.id
      );
      getIO().to(chatId).emit('userRemoved', { chatId, userId });
      return chat;
    },

    createGroup: async (
      _: any,
      { name, participantIds }: { name: string; participantIds: string[] },
      { dataSources, currentUser }: ApolloContext
    ) => {
      const group = await dataSources.chat.createGroup(
        name,
        currentUser.id,
        participantIds
      );
      getIO().to(group._id).emit('groupCreated', group);
      return group;
    },
  },
};
