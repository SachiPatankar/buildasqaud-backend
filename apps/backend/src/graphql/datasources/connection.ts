import { IConnectionDataSource } from './types';
import { ConnectionModel, UserModel, ChatModel } from '@db'; // Assuming the models are in @db
import { Connection } from '../../types/generated'; // Import generated types for Connection
import { safeEmitToUser } from '@socket'; // Import the socket helper

export default class ConnectionDataSource implements IConnectionDataSource {
  sendFriendReq = async (
    requesterUserId: string,
    addresseeUserId: string,
    message: string
  ): Promise<Connection> => {
    const newConnection = new ConnectionModel({
      requester_user_id: requesterUserId,
      addressee_user_id: addresseeUserId,
      status: 'pending',
      message,
    });

    const savedConnection = await newConnection.save();

    // Emit notification to addressee
    safeEmitToUser(addresseeUserId, 'notification', {
      type: 'friendRequest',
      connectionId: savedConnection._id,
      fromUserId: requesterUserId,
      message,
      createdAt: savedConnection.created_at,
    });

    return savedConnection;
  };

  acceptFriendReq = async (connectionId: string): Promise<Connection> => {
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

    // Decrement friend request count for addressee
    safeEmitToUser(connection.addressee_user_id, 'friendRequestDecrement', {});

    return connection;
  };

  declineFriendReq = async (connectionId: string): Promise<boolean> => {
    const connection = await ConnectionModel.findByIdAndDelete(connectionId);

    if (connection) {
      // Decrement friend request count for addressee
      safeEmitToUser(
        connection.addressee_user_id,
        'friendRequestDecrement',
        {}
      );
      return true;
    }

    return false;
  };

  blockUser = async (
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<Connection> => {
    const connection = await ConnectionModel.findOneAndUpdate(
      {
        requester_user_id: requesterUserId,
        addressee_user_id: addresseeUserId,
      },
      { status: 'blocked', responded_at: new Date() },
      { new: true }
    );
    return connection!;
  };

  removeConnection = async (connectionId: string): Promise<boolean> => {
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
  };

  loadConnectionsList = async (userId: string): Promise<Connection[]> => {
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
  };

  loadPendingFriendRequests = async (userId: string): Promise<Connection[]> => {
    try {
      // Use aggregation pipeline for better performance
      const connections = await ConnectionModel.aggregate([
        // Stage 1: Match pending requests for the user
        {
          $match: {
            addressee_user_id: userId,
            status: 'pending'
          }
        },
        // Stage 2: Add other user ID field
        {
          $addFields: {
            other_user_id: '$requester_user_id'
          }
        },
        // Stage 3: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'other_user_id',
            foreignField: '_id',
            as: 'other_user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$other_user'
        },
        // Stage 4: Project final format
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
            photo: '$other_user.photo'
          }
        }
      ]);

      return connections;
    } catch (error) {
      console.error('Error in loadPendingFriendRequests:', error);
      // Fallback to original implementation
      const connections = await ConnectionModel.find({
        addressee_user_id: userId,
        status: 'pending',
      }).lean();
      const otherUserIds = connections.map((conn) => conn.requester_user_id);
      const users = await UserModel.find({ _id: { $in: otherUserIds } }).lean();
      const userMap = users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
      return connections.map((conn) => {
        const user = userMap[conn.requester_user_id] || {};
        return {
          ...conn,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          photo: user.photo || '',
        };
      });
    }
  };

  loadSentFriendRequests = async (userId: string): Promise<Connection[]> => {
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
  };

  checkConnectionStatus = async (
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<string> => {
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
  };
}
