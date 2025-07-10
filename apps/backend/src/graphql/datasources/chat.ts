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
    // Validate chat and participant
    const chat = await ChatModel.findById(chatId);
    if (!chat || !chat.participant_ids.includes(senderId)) {
      throw new Error('Unauthorized or chat not found');
    }
    const newMessage = new MessageModel({
      chat_id: chatId,
      sender_id: senderId,
      content: content,
      is_deleted: false,
      read_by: [],
    });
    await newMessage.save();
    await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        last_message_id: newMessage._id,
        last_message_at: new Date(),
        is_active: true,
      }
    );
    const io = getIO();
    // Use io.to() instead of socket.to() to include ALL users in the room
    io.to(chatId).emit('receiveMessage', newMessage);

    // Emit unread chat count to each recipient's user-{userId} room
    const recipientIds = chat.participant_ids.filter(
      (id: string) => id !== senderId
    );
    for (const recipientId of recipientIds) {
      // Get total unread count for this recipient
      const unreadCounts = await this.getUnreadCountForChats(recipientId);
      // Sum all unread counts for this user
      const totalUnread = unreadCounts.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
      io.to(`user-${recipientId}`).emit('unreadChatCount', {
        count: totalUnread,
      });
    }
    return newMessage;
  }

  // Edit an existing message
  async editMessage(
    messageId: string,
    content: string,
    userId: string
  ): Promise<Message> {
    const message = await MessageModel.findById(messageId);
    if (!message) throw new Error('Message not found');
    // Validate user is sender
    if (message.sender_id !== userId) throw new Error('Unauthorized');
    message.content = content;
    message.edited_at = new Date();
    await message.save();
    const io = getIO();
    io.to(message.chat_id).emit('updateMessage', message);
    return message;
  }

  // Delete a message
  async deleteMessage(
    messageId: string,
    userId: string,
    forAll = false
  ): Promise<boolean> {
    const message = await MessageModel.findById(messageId);
    if (!message) throw new Error('Message not found');
    // Validate user is participant
    const chat = await ChatModel.findById(message.chat_id);
    if (!chat || !chat.participant_ids.includes(userId))
      throw new Error('Unauthorized');
    if (forAll) {
      message.is_deleted = true;
    } else {
      if (!message.deleted_for.includes(userId)) {
        message.deleted_for.push(userId);
      }
    }
    await message.save();
    const io = getIO();
    io.to(message.chat_id).emit('deleteMessage', message);
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
      .sort({ created_at: 1 });
  }

  // Get chat list for a user (only active chats)
  async getChatListForUser(userId: string): Promise<Chat[]> {
    const chats = await ChatModel.aggregate([
      {
        $match: {
          is_active: true,
          participant_ids: userId,
        },
      },
      {
        $addFields: {
          other_user_id: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$participant_ids',
                  as: 'id',
                  cond: { $ne: ['$$id', userId] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'usermodels',
          localField: 'other_user_id',
          foreignField: '_id',
          as: 'other_user',
        },
      },
      { $unwind: '$other_user' },
      {
        $lookup: {
          from: 'messagemodels',
          localField: 'last_message_id',
          foreignField: '_id',
          as: 'last_message',
        },
      },
      { $unwind: { path: '$last_message', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'messagemodels',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chat_id', '$$chatId'] },
                    { $eq: ['$is_deleted', false] },
                    { $not: [{ $in: [userId, '$read_by.user_id'] }] },
                  ],
                },
              },
            },
          ],
          as: 'unread_messages',
        },
      },
      {
        $addFields: {
          unread_count: { $size: '$unread_messages' },
        },
      },
      {
        $project: {
          _id: 1,
          other_user_id: 1,
          participant_ids: 1,
          first_name: '$other_user.first_name',
          last_name: '$other_user.last_name',
          photo: '$other_user.photo',
          last_message_id: 1,
          last_message_content: '$last_message.content',
          last_message_at: 1,
          unread_count: 1,
          is_active: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
      { $sort: { last_message_at: -1, updated_at: -1 } },
    ]);
    return chats;
  }

  // Get unread message count for each chat for a user
  async getUnreadCountForChats(
    userId: string
  ): Promise<{ chat_id: string; unread_count: number }[]> {
    // Use aggregation for efficiency
    return MessageModel.aggregate([
      { $match: { is_deleted: false, 'read_by.user_id': { $ne: userId } } },
      { $group: { _id: '$chat_id', unread_count: { $sum: 1 } } },
      { $project: { chat_id: '$_id', unread_count: 1, _id: 0 } },
    ]);
  }

  // Get all active chat IDs for a user
  async getChatIdsForUser(userId: string): Promise<string[]> {
    const chats = await ChatModel.find(
      {
        is_active: true,
        participant_ids: userId,
      },
      { _id: 1 }
    );
    return chats.map((chat: any) => String(chat._id));
  }

  // Mark all messages in a chat as read by a user
  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    const messages = await MessageModel.find({
      chat_id: chatId,
      is_deleted: false,
      'read_by.user_id': { $ne: userId },
    });
    const now = new Date();
    for (const message of messages) {
      message.read_by.push({ user_id: userId, read_at: now });
      await message.save();
    }
    // Emit updated unread count to the user's notification room
    const io = getIO();
    const unreadCounts = await this.getUnreadCountForChats(userId);
    const totalUnread = unreadCounts.reduce(
      (sum, c) => sum + (c.unread_count || 0),
      0
    );
    io.to(`user-${userId}`).emit('unreadChatCount', { count: totalUnread });
    return true;
  }
}
