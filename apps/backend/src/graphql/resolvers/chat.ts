import { ApolloContext } from '../types';
import {
  SendMessageInput,
  EditMessageInput,
  DeleteMessageInput,
  Message,
  Chat
} from '../../types/generated'; // Generated types from codegen

const resolvers = {
  Query: {
    getMessagesForChat: async (
      _: any,
      { chatId, page = 1, limit = 10 }: { chatId: string; page: number; limit: number },
      context: ApolloContext
    ): Promise<Message[]> => {
      return context.dataSources.chat.getMessagesForChat(chatId, page, limit);
    },

    getChatListForUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Chat[]> => {
      return context.dataSources.chat.getChatListForUser(userId);
    },

    getUnreadCountForChats: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<{ chat_id: string, unread_count: number }[]> => {
      return context.dataSources.chat.getUnreadCountForChats(userId);
    }
  },

  Mutation: {
    sendMessage: async (
      _: any,
      { input }: { input: SendMessageInput },
      context: ApolloContext
    ): Promise<Message> => {
      return context.dataSources.chat.sendMessage(input.chatId, input.senderId, input.content);
    },

    editMessage: async (
      _: any,
      { input }: { input: EditMessageInput },
      context: ApolloContext
    ): Promise<Message> => {
      return context.dataSources.chat.editMessage(input.messageId, input.content);
    },

    deleteMessage: async (
      _: any,
      { input }: { input: DeleteMessageInput },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.chat.deleteMessage(input.messageId);
    }
  }
};

export default resolvers;
