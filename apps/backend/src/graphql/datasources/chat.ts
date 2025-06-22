import { IChatDataSource } from './types';
import { MessageModel, ChatModel } from '@db'; // Assuming you have these models
import { getIO } from '@socket'; // Import the socket helper
import { Message, Chat } from '../../types/generated'; // Generated types from codegen

export default class ChatDataSource implements IChatDataSource {
  // Send a message and emit via socket
  async sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const newMessage = new MessageModel({
      chat_id: chatId,
      sender_id: senderId,
      content: content,
      is_deleted: false,
      read_by: [],
    });

    await newMessage.save();

    // Update last message in the chat
    await ChatModel.findOneAndUpdate(
      { _id: chatId },
      { last_message_id: newMessage._id, last_message_at: new Date() }
    );

    // Emit the new message via Socket.io
    const io = getIO();
    io.to(chatId).emit('receiveMessage', newMessage);

    return newMessage;
  }

  // Edit an existing message
  async editMessage(messageId: string, content: string): Promise<Message> {
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { content, edited_at: new Date() },
      { new: true }
    );

    if (!updatedMessage) throw new Error('Message not found');

    // Emit the updated message via Socket.io
    const io = getIO();
    io.to(updatedMessage.chat_id).emit('updateMessage', updatedMessage);

    return updatedMessage;
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<boolean> {
    const deletedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { is_deleted: true },
      { new: true }
    );

    if (!deletedMessage) throw new Error('Message not found');

    // Emit the deleted message via Socket.io
    const io = getIO();
    io.to(deletedMessage.chat_id).emit('deleteMessage', deletedMessage);

    return true;
  }

  // Get all messages in a chat
  async getMessagesForChat(
    chatId: string,
    page: number,
    limit: number
  ): Promise<Message[]> {
    return MessageModel.find({ chat_id: chatId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });
  }

  // Get chat list for a user (only active chats)
  async getChatListForUser(userId: string): Promise<Chat[]> {
    return ChatModel.find({ participant_ids: userId, is_active: true });
  }

  // Get unread message count for each chat for a user
  async getUnreadCountForChats(
    userId: string
  ): Promise<{ chat_id: string; unread_count: number }[]> {
    const chats = await ChatModel.find({ participant_ids: userId });
    const unreadCounts = [];

    for (const chat of chats) {
      const unreadMessages = await MessageModel.countDocuments({
        chat_id: chat._id,
        'read_by.user_id': { $ne: userId },
        is_deleted: false,
      });

      unreadCounts.push({ chat_id: chat._id, unread_count: unreadMessages });
    }

    return unreadCounts;
  }
}
