import { IConnectionDataSource } from './types';
import { ConnectionModel, UserModel, ChatModel, MessageModel } from '@db'; // Assuming the models are in @db
import { Connection } from '../../types/generated'; // Import generated types for Connection

export default class ConnectionDataSource implements IConnectionDataSource {
  // Send a friend request
  async sendFriendReq(
    requesterUserId: string,
    addresseeUserId: string,
    message: string
  ): Promise<Connection> {
    const newConnection = new ConnectionModel({
      requester_user_id: requesterUserId,
      addressee_user_id: addresseeUserId,
      status: 'pending',
      message,
    });
    return newConnection.save();
  }

  // Accept a friend request
  async acceptFriendReq(connectionId: string): Promise<Connection> {
    const connection = await ConnectionModel.findByIdAndUpdate(
      connectionId,
      { status: 'accepted', responded_at: new Date() },
      { new: true }
    );
    if (!connection) throw new Error('Connection not found');

    // Check if chat already exists
    let chat = await ChatModel.findOne({
      participant_ids: {
        $all: [connection.requester_user_id, connection.addressee_user_id],
      },
    });
    if (!chat) {
      chat = await ChatModel.create({
        participant_ids: [
          connection.requester_user_id,
          connection.addressee_user_id,
        ],
        is_active: false,
      });
    }
    connection.chat_id = chat._id;
    await connection.save();

    // Update connections_count for both users
    await UserModel.updateOne(
      { _id: connection.requester_user_id },
      { $inc: { connections_count: 1 } }
    );
    await UserModel.updateOne(
      { _id: connection.addressee_user_id },
      { $inc: { connections_count: 1 } }
    );

    return connection;
  }

  // Decline a friend request
  async declineFriendReq(connectionId: string): Promise<boolean> {
    const connection = await ConnectionModel.findByIdAndDelete(connectionId);
    return connection ? true : false;
  }

  // Block a user
  async blockUser(
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<Connection> {
    const connection = await ConnectionModel.findOneAndUpdate(
      {
        requester_user_id: requesterUserId,
        addressee_user_id: addresseeUserId,
      },
      { status: 'blocked', responded_at: new Date() },
      { new: true }
    );
    return connection!;
  }

  // Remove a connection
  async removeConnection(connectionId: string): Promise<boolean> {
    const connection = await ConnectionModel.findByIdAndDelete(connectionId);
    if (connection) {
      // Decrement connections_count for both users
      await UserModel.updateOne(
        { _id: connection.requester_user_id },
        { $inc: { connections_count: -1 } }
      );
      await UserModel.updateOne(
        { _id: connection.addressee_user_id },
        { $inc: { connections_count: -1 } }
      );
    }
    return connection ? true : false;
  }

  // Load connections list for a user
  async loadConnectionsList(userId: string): Promise<Connection[]> {
    const connections = await ConnectionModel.aggregate([
      {
        $match: {
          $or: [{ requester_user_id: userId }, { addressee_user_id: userId }],
          status: 'accepted',
        },
      },
      {
        $addFields: {
          other_user_id: {
            $cond: [
              { $eq: ['$requester_user_id', userId] },
              '$addressee_user_id',
              '$requester_user_id',
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
        $project: {
          _id: 1,
          requester_user_id: 1,
          addressee_user_id: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          other_user_id: 1,
          chat_id: 1,
          first_name: '$other_user.first_name',
          last_name: '$other_user.last_name',
          photo: '$other_user.photo',
        },
      },
    ]);
    return connections;
  }

  // Load pending friend requests for a user
  async loadPendingFriendRequests(userId: string): Promise<Connection[]> {
    const connections = await ConnectionModel.find({
      $or: [
        { requester_user_id: userId, status: 'pending' },
        { addressee_user_id: userId, status: 'pending' },
      ],
    }).lean();
    const otherUserIds = connections.map((conn) =>
      conn.requester_user_id === userId
        ? conn.addressee_user_id
        : conn.requester_user_id
    );
    const users = await UserModel.find({ _id: { $in: otherUserIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    return connections.map((conn) => {
      const otherId =
        conn.requester_user_id === userId
          ? conn.addressee_user_id
          : conn.requester_user_id;
      const user = userMap[otherId] || {};
      return {
        ...conn,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        photo: user.photo || '',
      };
    });
  }

  // Load sent friend requests for a user
  async loadSentFriendRequests(userId: string): Promise<Connection[]> {
    const connections = await ConnectionModel.aggregate([
      {
        $match: {
          requester_user_id: userId,
          status: 'pending',
        },
      },
      {
        $addFields: {
          other_user_id: '$addressee_user_id',
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
        $project: {
          _id: 1,
          requester_user_id: 1,
          addressee_user_id: 1,
          status: 1,
          created_at: 1,
          updated_at: 1,
          other_user_id: 1,
          first_name: '$other_user.first_name',
          last_name: '$other_user.last_name',
          photo: '$other_user.photo',
        },
      },
    ]);
    return connections;
  }

  // Check connection status between two users
  async checkConnectionStatus(
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<string> {
    const connection = await ConnectionModel.findOne({
      $or: [
        {
          requester_user_id: requesterUserId,
          addressee_user_id: addresseeUserId,
        },
        {
          requester_user_id: addresseeUserId,
          addressee_user_id: requesterUserId,
        },
      ],
    });
    return connection ? connection.status : 'none';
  }

  async getUnreadCountForChats(userId: string) {
    return MessageModel.aggregate([
      { $match: { is_deleted: false, 'read_by.user_id': { $ne: userId } } },
      { $group: { _id: '$chat_id', unread_count: { $sum: 1 } } },
    ]);
  }

  async deleteMessage(messageId: string, userId: string, forAll = false) {
    if (forAll) {
      await MessageModel.findByIdAndUpdate(messageId, { is_deleted: true });
    } else {
      await MessageModel.findByIdAndUpdate(messageId, {
        $addToSet: { deleted_for: userId },
      });
    }
  }
}
