import { IConnectionDataSource } from './types';
import { ConnectionModel } from '@db'; // Assuming the model is in @db
import { Connection } from '../../types/generated'; // Import generated types for Connection

export default class ConnectionDataSource implements IConnectionDataSource {
  // Send a friend request
  async sendFriendReq(requesterUserId: string, addresseeUserId: string, message: string): Promise<Connection> {
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
  async blockUser(requesterUserId: string, addresseeUserId: string): Promise<Connection> {
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
    return ConnectionModel.find({
      $or: [
        { requester_user_id: userId },
        { addressee_user_id: userId }
      ]
    });
  }

  // Load pending friend requests for a user
  async loadPendingFriendRequests(userId: string): Promise<Connection[]> {
    return ConnectionModel.find({
      $or: [
        { requester_user_id: userId, status: 'pending' },
        { addressee_user_id: userId, status: 'pending' }
      ]
    });
  }

  // Load sent friend requests for a user
  async loadSentFriendRequests(userId: string): Promise<Connection[]> {
    return ConnectionModel.find({
      requester_user_id: userId,
      status: 'pending',
    });
  }

  // Check connection status between two users
  async checkConnectionStatus(requesterUserId: string, addresseeUserId: string): Promise<string> {
    const connection = await ConnectionModel.findOne({
      $or: [
        { requester_user_id: requesterUserId, addressee_user_id: addresseeUserId },
        { requester_user_id: addresseeUserId, addressee_user_id: requesterUserId }
      ]
    });
    return connection ? connection.status : 'none';
  }
}
