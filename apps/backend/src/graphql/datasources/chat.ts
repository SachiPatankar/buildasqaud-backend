import { IChatDataSource } from './types';
import { ChatModel, MessageModel, ConnectionModel } from '@db';
import { safeEmitToChat, safeEmitToUser } from '@socket';
import {
  incrementChatCount,
  getChatCounts,
  getTotalCount,
  resetChatCount,
  batchSetChatCounts,
  isRedisAvailable,
} from '../../lib/redis-helpers';
import { Message, Chat } from '../../types/generated';

export default class ChatDataSource implements IChatDataSource {
  sendMessage = async (
    chatId: string,
    senderId: string,
    content: string
  ): Promise<Message> => {
    const chat = await ChatModel.findById(chatId);
    if (!chat || !chat.participant_ids.includes(senderId)) {
      throw new Error('Unauthorized or chat not found');
    }

    const newMessage = await MessageModel.create({
      chat_id: chatId,
      sender_id: senderId,
      content,
      read_by: [{ user_id: senderId, read_at: new Date() }],
      is_deleted: false,
      deleted_for: [],
    });

    // Update chat with last message info
    await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        last_message_id: newMessage._id,
        last_message_at: new Date(),
        is_active: true,
      }
    );

    // Emit to chat room
    safeEmitToChat(chatId, 'receiveMessage', newMessage);

    // Update unread counts for recipients
    const recipientIds = chat.participant_ids.filter(
      (id: string) => id !== senderId
    );

    for (const recipientId of recipientIds) {
      try {
        // Try Redis first, fallback to MongoDB if Redis is unavailable
        if (isRedisAvailable()) {
          await incrementChatCount(recipientId, chatId);
          
          // Get updated counts and emit
          const chatCount = (await getChatCounts(recipientId))[chatId] || 0;
          const totalCount = await getTotalCount(recipientId);

          safeEmitToUser(recipientId, 'chatUnreadUpdate', {
            chatId,
            count: chatCount,
          });
          safeEmitToUser(recipientId, 'totalUnreadUpdate', {
            count: totalCount,
          });
        } else {
          // Redis unavailable - calculate from MongoDB and emit
          const unreadCount = await MessageModel.countDocuments({
            chat_id: chatId,
            sender_id: { $ne: recipientId },
            is_deleted: false,
            'read_by.user_id': { $ne: recipientId },
          });

          const totalUnread = await MessageModel.countDocuments({
            chat_id: { $in: await this.getChatIdsForUser(recipientId) },
            sender_id: { $ne: recipientId },
            is_deleted: false,
            'read_by.user_id': { $ne: recipientId },
          });

          safeEmitToUser(recipientId, 'chatUnreadUpdate', {
            chatId,
            count: unreadCount,
          });
          safeEmitToUser(recipientId, 'totalUnreadUpdate', {
            count: totalUnread,
          });
        }
      } catch (error) {
        console.error(
          `Failed to update unread count for user ${recipientId}:`,
          error
        );
        
        // Fallback to MongoDB calculation
        try {
          const unreadCount = await MessageModel.countDocuments({
            chat_id: chatId,
            sender_id: { $ne: recipientId },
            is_deleted: false,
            'read_by.user_id': { $ne: recipientId },
          });

          const totalUnread = await MessageModel.countDocuments({
            chat_id: { $in: await this.getChatIdsForUser(recipientId) },
            sender_id: { $ne: recipientId },
            is_deleted: false,
            'read_by.user_id': { $ne: recipientId },
          });

          safeEmitToUser(recipientId, 'chatUnreadUpdate', {
            chatId,
            count: unreadCount,
          });
          safeEmitToUser(recipientId, 'totalUnreadUpdate', {
            count: totalUnread,
          });
        } catch (fallbackError) {
          console.error('Fallback calculation also failed:', fallbackError);
        }
      }
    }

    return newMessage;
  };

  editMessage = async (
    messageId: string,
    content: string,
    userId: string
  ): Promise<Message> => {
    const message = await MessageModel.findOneAndUpdate(
      { _id: messageId, sender_id: userId },
      { content, edited_at: new Date() },
      { new: true }
    );

    if (!message) {
      throw new Error('Message not found or unauthorized');
    }

    safeEmitToChat(message.chat_id, 'messageEdited', message);
    return message;
  };

  deleteMessage = async (
    messageId: string,
    userId: string,
    forAll = false
  ): Promise<boolean> => {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (forAll) {
      // Delete for everyone
      await MessageModel.findByIdAndUpdate(messageId, {
        is_deleted: true,
        deleted_for: [],
      });
      safeEmitToChat(message.chat_id, 'messageDeleted', { messageId });
    } else {
      // Delete for user only
      await MessageModel.findByIdAndUpdate(messageId, {
        $push: { deleted_for: userId },
      });
      safeEmitToUser(userId, 'messageDeleted', { messageId });
    }

    return true;
  };

  getMessagesForChat = async (
    chatId: string,
    page: number,
    limit: number
  ): Promise<Message[]> => {
    const skip = (page - 1) * limit;
    return await MessageModel.find({
      chat_id: chatId,
      is_deleted: false,
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
  };

  getChatListForUser = async (userId: string): Promise<Chat[]> => {
    const chats = await ChatModel.aggregate([
      {
        $match: {
          participant_ids: userId,
          is_active: true,
        },
      },
      {
        $lookup: {
          from: 'usermodels',
          let: { participantIds: '$participant_ids' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$_id', '$$participantIds'] },
                    { $ne: ['$_id', { $toObjectId: userId }] },
                  ],
                },
              },
            },
          ],
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
  };

  getUnreadCountForChats = async (
    userId: string
  ): Promise<{ chat_id: string; unread_count: number }[]> => {
    // Try Redis first if available
    if (isRedisAvailable()) {
      try {
        const redisCounts = await getChatCounts(userId);
        if (Object.keys(redisCounts).length > 0) {
          return Object.entries(redisCounts).map(([chat_id, unread_count]) => ({
            chat_id,
            unread_count,
          }));
        }
      } catch (error) {
        console.log('Redis unavailable, falling back to MongoDB...');
      }
    }

    // Fallback: calculate from MongoDB
    const chats = await ChatModel.find({ participant_ids: userId }, { _id: 1 });
    const chatIds = chats.map((c: any) => c._id.toString());

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

    // Build counts object
    const countsObj: Record<string, number> = {};
    for (const chatId of chatIds) {
      const found = unreadAgg.find(
        (c: any) => String(c._id) === String(chatId)
      );
      countsObj[chatId] = found ? found.unread_count : 0;
    }

    // Try to update Redis if available
    if (isRedisAvailable()) {
      try {
        await batchSetChatCounts(userId, countsObj);
      } catch (error) {
        console.log('Failed to update Redis, continuing with MongoDB data');
      }
    }

    return Object.entries(countsObj).map(([chat_id, unread_count]) => ({
      chat_id,
      unread_count,
    }));
  };

  getChatIdsForUser = async (userId: string): Promise<string[]> => {
    const chats = await ChatModel.find(
      {
        is_active: true,
        participant_ids: userId,
      },
      { _id: 1 }
    );
    return chats.map((chat: any) => String(chat._id));
  };

  markMessagesAsRead = async (
    chatId: string,
    userId: string
  ): Promise<boolean> => {
    const now = new Date();
    await MessageModel.updateMany(
      {
        chat_id: chatId,
        is_deleted: false,
        'read_by.user_id': { $ne: userId },
      },
      { $push: { read_by: { user_id: userId, read_at: now } } }
    );

    // Try Redis first, fallback to MongoDB calculation
    if (isRedisAvailable()) {
      try {
        await resetChatCount(userId, chatId, 0);
        const totalUnread = await getTotalCount(userId);

        safeEmitToUser(userId, 'chatUnreadUpdate', { chatId, count: 0 });
        safeEmitToUser(userId, 'totalUnreadUpdate', { count: totalUnread });
      } catch (error) {
        console.log('Redis failed, using MongoDB calculation');
        // Fallback to MongoDB calculation
        const totalUnread = await MessageModel.countDocuments({
          chat_id: { $in: await this.getChatIdsForUser(userId) },
          sender_id: { $ne: userId },
          is_deleted: false,
          'read_by.user_id': { $ne: userId },
        });

        safeEmitToUser(userId, 'chatUnreadUpdate', { chatId, count: 0 });
        safeEmitToUser(userId, 'totalUnreadUpdate', { count: totalUnread });
      }
    } else {
      // Redis unavailable - use MongoDB calculation
      const totalUnread = await MessageModel.countDocuments({
        chat_id: { $in: await this.getChatIdsForUser(userId) },
        sender_id: { $ne: userId },
        is_deleted: false,
        'read_by.user_id': { $ne: userId },
      });

      safeEmitToUser(userId, 'chatUnreadUpdate', { chatId, count: 0 });
      safeEmitToUser(userId, 'totalUnreadUpdate', { count: totalUnread });
    }

    return true;
  };

  getInitialCounts = async (userId: string) => {
    let totalUnread = 0;
    let chatCounts = {};

    // Try Redis first if available
    if (isRedisAvailable()) {
      try {
        totalUnread = await getTotalCount(userId);
        chatCounts = await getChatCounts(userId);
        
        // If we got data from Redis, return it
        if (totalUnread > 0 || Object.keys(chatCounts).length > 0) {
          const friendRequestCount = await ConnectionModel.countDocuments({
            addressee_user_id: userId,
            status: 'pending',
          });

          return {
            totalUnread,
            chatCounts,
            friendRequestCount,
          };
        }
      } catch (error) {
        console.log('Redis unavailable, calculating from database...');
      }
    }

    // Fallback: Calculate from database
    const userChats = await ChatModel.find({
      participant_ids: userId,
    }).select('_id');

    const chatIds = userChats.map((chat) => chat._id);
    const counts: Record<string, number> = {};

    for (const chatId of chatIds) {
      const unreadCount = await MessageModel.countDocuments({
        chat_id: chatId,
        sender_id: { $ne: userId },
        is_deleted: false,
        'read_by.user_id': { $ne: userId },
      });

      if (unreadCount > 0) {
        counts[chatId.toString()] = unreadCount;
      }
    }

    chatCounts = counts;
    totalUnread = Object.values(counts).reduce((sum, c) => sum + c, 0);

    // Try to update Redis if available
    if (isRedisAvailable()) {
      try {
        await batchSetChatCounts(userId, counts);
      } catch (redisError) {
        console.error('Failed to update Redis:', redisError);
      }
    }

    // Get friend request count
    const friendRequestCount = await ConnectionModel.countDocuments({
      addressee_user_id: userId,
      status: 'pending',
    });

    return {
      totalUnread,
      chatCounts,
      friendRequestCount,
    };
  };
}
