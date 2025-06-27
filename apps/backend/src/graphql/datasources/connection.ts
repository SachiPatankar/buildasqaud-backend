import { IConnectionDataSource } from './types';
import { ConnectionModel, UserModel } from '@db'; // Assuming the models are in @db
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
    return ConnectionModel.findByIdAndUpdate(
      connectionId,
      { status: 'accepted', responded_at: new Date() },
      { new: true }
    );
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
    return connection ? true : false;
  }

  // Load connections list for a user
  async loadConnectionsList(userId: string): Promise<Connection[]> {
    const connections = await ConnectionModel.find({
      $or: [{ requester_user_id: userId }, { addressee_user_id: userId }],
    }).lean();
    // Find the other user in each connection
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
    const connections = await ConnectionModel.find({
      requester_user_id: userId,
      status: 'pending',
    }).lean();
    const otherUserIds = connections.map((conn) => conn.addressee_user_id);
    const users = await UserModel.find({ _id: { $in: otherUserIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    return connections.map((conn) => {
      const user = userMap[conn.addressee_user_id] || {};
      return {
        ...conn,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        photo: user.photo || '',
      };
    });
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
}
