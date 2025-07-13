import { IChatDataSource } from './types';
import { MessageModel, ChatModel, UserModel } from '@db'; // Assuming you have these models
import { getIO } from '@socket'; // Import the socket helper
import { Message, Chat } from '../../types/generated'; // Generated types from codegen
import {
  incrementChatCount,
  incrementTotalCount,
  resetChatCount,
  getChatCounts,
  getTotalCount,
  setTotalCount,
} from '../../lib/redis-helpers';

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
    // Save message with sender in read_by
    const newMessage = new MessageModel({
      chat_id: chatId,
      sender_id: senderId,
      content: content,
      is_deleted: false,
      read_by: [{ user_id: senderId, read_at: new Date() }],
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
    // Emit to chat room
    io.to(chatId).emit('receiveMessage', newMessage);

    // Unread logic for recipients
    const recipientIds = chat.participant_ids.filter(
      (id: string) => id !== senderId
    );
    for (const recipientId of recipientIds) {
      await incrementChatCount(recipientId, chatId);
      await incrementTotalCount(recipientId);
      // Emit per-chat and total unread updates
      const chatCount = (await getChatCounts(recipientId))[chatId] || 0;
      const totalCount = await getTotalCount(recipientId);
      io.to(`user-${recipientId}`).emit('chatUnreadUpdate', {
        chatId,
        count: chatCount,
      });
      io.to(`user-${recipientId}`).emit('totalUnreadUpdate', {
        count: totalCount,
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
    // 1. Try Redis first
    const redisCounts = await getChatCounts(userId);
    if (Object.keys(redisCounts).length > 0) {
      // Redis has data, return it
      return Object.entries(redisCounts).map(([chat_id, unread_count]) => ({
        chat_id,
        unread_count,
      }));
    }
    // 2. Fallback: calculate from MongoDB
    // Find all chats for user
    const chats = await ChatModel.find({ participant_ids: userId }, { _id: 1 });
    const chatIds = chats.map((c: any) => c._id.toString());
    // Aggregate unread counts per chat
    const unreadAgg = await MessageModel.aggregate([
      {
        $match: {
          is_deleted: false,
          chat_id: { $in: chatIds },
          'read_by.user_id': { $ne: userId },
        },
      },
      { $group: { _id: '$chat_id', unread_count: { $sum: 1 } } },
    ]);
    // Build result and update Redis
    const countsObj: Record<string, number> = {};
    for (const chatId of chatIds) {
      const found = unreadAgg.find(
        (c: any) => String(c._id) === String(chatId)
      );
      const count = found ? found.unread_count : 0;
      countsObj[chatId] = count;
      // Store in Redis
      await resetChatCount(userId, chatId, count);
    }
    // Store total in Redis
    const total = Object.values(countsObj).reduce((sum, c) => sum + c, 0);
    await setTotalCount(userId, total);
    // Return as array
    return Object.entries(countsObj).map(([chat_id, unread_count]) => ({
      chat_id,
      unread_count,
    }));
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
    // Bulk update: mark all unread messages as read for this user
    const now = new Date();
    await MessageModel.updateMany(
      {
        chat_id: chatId,
        is_deleted: false,
        'read_by.user_id': { $ne: userId },
      },
      { $push: { read_by: { user_id: userId, read_at: now } } }
    );
    await resetChatCount(userId, chatId, 0);
    const io = getIO();
    const totalUnread = await getTotalCount(userId);
    io.to(`user-${userId}`).emit('chatUnreadUpdate', {
      chatId,
      count: 0,
    });
    io.to(`user-${userId}`).emit('totalUnreadUpdate', {
      count: totalUnread,
    });
    return true;
  }
}
