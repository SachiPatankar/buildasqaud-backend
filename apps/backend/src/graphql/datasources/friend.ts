import { Friend, FriendStatus, FriendshipType } from '@db';

import { IFriendDataSource } from './types';
import { GraphQLError } from 'graphql';

export default class FriendSource implements IFriendDataSource {
  sendRequest = async (fromUserId: string, toUserId: string) => {
    const exists = await Friend.findOne({
      user_id: fromUserId,
      friend_id: toUserId,
    });
    if (exists)
      throw new GraphQLError('Request already sent or you are already friends');

    const outgoing = await Friend.create({
      user_id: fromUserId,
      friend_id: toUserId,
      status: FriendStatus.REQUESTED,
      friendship_type: FriendshipType.PENDING,
    });

    await Friend.create({
      user_id: toUserId,
      friend_id: fromUserId,
      status: FriendStatus.INCOMING,
      friendship_type: FriendshipType.PENDING,
    });
    return outgoing;
  };

  respondToRequest = async (
    requestId: string,
    accept: boolean,
    currentUserId: string
  ) => {
    const incoming = await Friend.findById(requestId);
    if (
      !incoming ||
      incoming.user_id !== currentUserId ||
      incoming.status !== FriendStatus.INCOMING
    ) {
      throw new GraphQLError('Invalid request');
    }

    const outgoing = await Friend.findOne({
      user_id: incoming.friend_id,
      friend_id: incoming.user_id,
    });
    if (!outgoing) throw new GraphQLError('Counterpart not found');

    if (accept) {
      incoming.status = FriendStatus.FRIEND;
      incoming.friendship_type = FriendshipType.ACCEPTED;
      outgoing.status = FriendStatus.FRIEND;
      outgoing.friendship_type = FriendshipType.ACCEPTED;

      await incoming.save();
      await outgoing.save();

      return incoming;
    } else {
      await incoming.deleteOne();
      await outgoing.deleteOne();
      return;
    }
  };

  cancelRequest = async (requestId: string, currentUserId: string) => {
    const outgoing = await Friend.findById(requestId);
    if (
      !outgoing ||
      outgoing.user_id !== currentUserId ||
      outgoing.status !== FriendStatus.REQUESTED
    ) {
      throw new GraphQLError('Cannot cancel');
    }
    const incoming = await Friend.findOne({
      user_id: outgoing.friend_id,
      friend_id: outgoing.user_id,
    });
    await outgoing.deleteOne();
    if (incoming) await incoming.deleteOne();
    return true;
  };

  removeFriend = async (friendshipId: string, currentUserId: string) => {
    const rec = await Friend.findById(friendshipId);
    if (
      !rec ||
      rec.user_id !== currentUserId ||
      rec.status !== FriendStatus.FRIEND
    ) {
      throw new GraphQLError('Not friends');
    }
    const inverse = await Friend.findOne({
      user_id: rec.friend_id,
      friend_id: rec.user_id,
    });
    await rec.deleteOne();
    if (inverse) await inverse.deleteOne();
    return true;
  };
}
