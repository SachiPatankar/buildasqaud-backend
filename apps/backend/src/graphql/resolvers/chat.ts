import { ApolloContext } from '../types';
import {
  Message,
  Chat,
  UnreadChatCount,
} from '../../types/generated'; // Generated types from codegen

const resolvers = {
  Query: {
    getMessagesForChat: async (
      _: any,
      {
        chatId,
        page = 1,
        limit = 10,
      }: { chatId: string; page: number; limit: number },
      context: ApolloContext
    ): Promise<Message[]> => {
      return context.dataSources.chat.getMessagesForChat(chatId, page, limit);
    },

    getChatListForUser: async (
      _: any,
      __: any,
      context: ApolloContext
    ): Promise<Chat[]> => {
      return context.dataSources.chat.getChatListForUser(context.currentUser.id);
    },

    getUnreadCountForChats: async (
      _: any,
      __: any,
      context: ApolloContext
    ): Promise<UnreadChatCount[]> => {
      return context.dataSources.chat.getUnreadCountForChats(context.currentUser.id);
    },
  },

  Mutation: {
    sendMessage: async (
      _: any,
      { chatId, content }: { chatId: string; content: string },
      context: ApolloContext
    ): Promise<Message> => {
      return context.dataSources.chat.sendMessage(
        chatId,
        context.currentUser.id,
        content
      );
    },

    editMessage: async (
      _: any,
      { messageId, content }: { messageId: string; content: string },
      context: ApolloContext
    ): Promise<Message> => {
      return context.dataSources.chat.editMessage(
        messageId,
        content
      );
    },

    deleteMessage: async (
      _: any,
      { messageId }: { messageId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.chat.deleteMessage(messageId);
    },
  },
};

export default resolvers;
