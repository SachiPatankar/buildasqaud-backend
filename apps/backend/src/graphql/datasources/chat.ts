import { IChatDataSource } from './types';
import { MessageModel, ChatModel, UserModel } from '@db'; // Assuming you have these models
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
    const chats = await ChatModel.find({ participant_ids: userId, is_active: true }).lean();
    // Find the other participant for each chat
    const otherUserIds = chats.map(chat => chat.participant_ids.find((id: string) => id !== userId)).filter(Boolean);
    const users = await UserModel.find({ _id: { $in: otherUserIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    // Fetch last message content for each chat
    const lastMessageIds = chats.map(chat => chat.last_message_id).filter(Boolean);
    const messages = await MessageModel.find({ _id: { $in: lastMessageIds } }).lean();
    const messageMap = messages.reduce((acc, msg) => {
      acc[msg._id] = msg;
      return acc;
    }, {});
    return chats.map(chat => {
      const otherId = chat.participant_ids.find((id: string) => id !== userId);
      const user = userMap[otherId] || {};
      const lastMessage = chat.last_message_id ? messageMap[chat.last_message_id] : null;
      return {
        ...chat,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        photo: user.photo || '',
        last_message_content: lastMessage ? lastMessage.content : '',
      };
    });
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
