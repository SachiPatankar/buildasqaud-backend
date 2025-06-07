import {
  Chat,
  GroupChat,
  GroupChatParticipant,
  Message,
  MessageVisibility,
  Friend,
  FriendshipType,
} from '@db';
import { IChatDataSource } from './types';
import { GraphQLError } from 'graphql';

export default class ChatSource implements IChatDataSource {
  // Send message in a chat (1:1 or group)
  sendMessage = async (chatId: string, senderId: string, content: string) => {
    // Validate chat exists (could be oneToOne or group)
    let chat = await Chat.findById(chatId);
    let isGroup = false;
    if (!chat) {
      chat = await GroupChat.findById(chatId);
      if (!chat) throw new GraphQLError('Chat not found');
      isGroup = true;
    }

    // check sender is participant or member of group
    if (isGroup) {
      const participant = await GroupChatParticipant.findOne({
        chat_id: chatId,
        user_id: senderId,
      });
      if (!participant) throw new GraphQLError('Sender not in group chat');
    } else {
      // For 1:1, check sender is one of participants
      if (!chat.participant_ids.includes(senderId))
        throw new GraphQLError('Sender not in 1:1 chat');
    }

    const msg = await Message.create({
      chat_id: chatId,
      sender_id: senderId,
      message: content,
      deleted_for_everyone: false,
    });

    // By default, message visible to sender
    await MessageVisibility.create({
      message_id: msg._id,
      user_id: senderId,
      visible: true,
    });

    return msg;
  };

  // Load messages visible to user in chat, with optional pagination
  loadPreviousMessages = async (
    chatId: string,
    userId: string,
    limit = 20,
    before?: Date
  ) => {
    // Validate chat exists
    const chat =
      (await Chat.findById(chatId)) || (await GroupChat.findById(chatId));
    if (!chat) throw new GraphQLError('Chat not found');

    // Check user is participant
    if ('participant_ids' in chat) {
      // 1:1 chat
      if (!chat.participant_ids.includes(userId))
        throw new GraphQLError('Not a participant in chat');
    } else {
      // Group chat
      const participant = await GroupChatParticipant.findOne({
        chat_id: chatId,
        user_id: userId,
      });
      if (!participant)
        throw new GraphQLError('Not a participant in group chat');
    }

    // Messages filter
    const filter: any = {
      chat_id: chatId,
      deleted_for_everyone: false,
    };
    if (before) filter.created_at = { $lt: before };

    // Find messages user deleted for themselves (visibility.visible = false)
    const invisibleMsgIds = await MessageVisibility.find({
      user_id: userId,
      visible: false,
    }).distinct('message_id');

    filter._id = { $nin: invisibleMsgIds };

    const msgs = await Message.find(filter)
      .sort({ created_at: -1 })
      .limit(limit);

    return msgs;
  };

  deleteMessageForEveryone = async (messageId: string, userId: string) => {
    const msg = await Message.findById(messageId);
    if (!msg) throw new GraphQLError('Message not found');
    if (msg.sender_id !== userId)
      throw new GraphQLError('Only sender can delete message for everyone');

    msg.deleted_for_everyone = true;
    await msg.save();

    // Remove all per-user visibility docs (optional cleanup)
    await MessageVisibility.deleteMany({ message_id: messageId });

    return true;
  };

  deleteMessageForMe = async (messageId: string, userId: string) => {
    // Upsert visibility to mark invisible for user
    await MessageVisibility.updateOne(
      { message_id: messageId, user_id: userId },
      { visible: false },
      { upsert: true }
    );
    return true;
  };

  // Create one-to-one chat (exactly 2 participants, must be friends)
  createChat = async (participantIds: string[], creatorId: string) => {
    const ids = Array.from(new Set([...participantIds, creatorId]));

    if (ids.length !== 2)
      throw new GraphQLError(
        'One-to-one chat must have exactly 2 participants'
      );

    const [a, b] = ids;

    // Check for existing chat linked via Friend document
    const rel = await Friend.findOne({
      $or: [
        { user_id: a, friend_id: b, friendship_type: FriendshipType.ACCEPTED },
        { user_id: b, friend_id: a, friendship_type: FriendshipType.ACCEPTED },
      ],
      chat_id: { $ne: null },
    });

    if (rel) {
      const existing = await Chat.findById(rel.chat_id);
      if (existing) return existing;
    }

    // Ensure friendship exists
    const friendship = await Friend.findOne({
      friendship_type: FriendshipType.ACCEPTED,
      $or: [
        { user_id: a, friend_id: b },
        { user_id: b, friend_id: a },
      ],
    });
    if (!friendship)
      throw new GraphQLError('Cannot start 1:1 chat without friendship');

    // Create new chat
    const chat = await Chat.create({ participant_ids: ids });

    // Update Friend docs to link chat
    await Friend.updateMany(
      {
        friendship_type: FriendshipType.ACCEPTED,
        $or: [
          { user_id: a, friend_id: b },
          { user_id: b, friend_id: a },
        ],
      },
      { chat_id: chat._id }
    );

    return chat;
  };

  // Create group chat
  createGroup = async (
    name: string,
    creatorId: string,
    participantIds: string[]
  ) => {
    const uniqueIds = Array.from(new Set([creatorId, ...participantIds]));

    const groupChat = await GroupChat.create({
      name,
      is_group: true,
    });

    const participantDocs = uniqueIds.map((uid) => ({
      chat_id: groupChat._id,
      user_id: uid,
      role: uid === creatorId ? 'ADMIN' : 'PARTICIPANT',
    }));
    await GroupChatParticipant.insertMany(participantDocs);

    return groupChat;
  };

  // Add user to group chat by admin only
  addToGroup = async (chatId: string, userIdToAdd: string, actorId: string) => {
    const chat = await GroupChat.findById(chatId);
    if (!chat || !chat.is_group) throw new GraphQLError('Group chat not found');

    const actor = await GroupChatParticipant.findOne({
      chat_id: chatId,
      user_id: actorId,
    });
    if (!actor || actor.role !== 'ADMIN')
      throw new GraphQLError('Only admins can add members');

    const exists = await GroupChatParticipant.findOne({
      chat_id: chatId,
      user_id: userIdToAdd,
    });
    if (exists) throw new GraphQLError('User already in group');

    await GroupChatParticipant.create({
      chat_id: chatId,
      user_id: userIdToAdd,
      role: 'PARTICIPANT',
    });

    return chat;
  };

  // Remove user from group chat by admin, or user themselves (leave)
  removeFromGroup = async (
    chatId: string,
    userIdToRemove: string,
    actorId: string
  ) => {
    const chat = await GroupChat.findById(chatId);
    if (!chat || !chat.is_group) throw new GraphQLError('Group chat not found');

    const actor = await GroupChatParticipant.findOne({
      chat_id: chatId,
      user_id: actorId,
    });
    if (!actor) throw new GraphQLError('Actor not in group');

    const removingSelf = userIdToRemove === actorId;
    if (!removingSelf && actor.role !== 'ADMIN') {
      throw new GraphQLError('Only admins can remove other users');
    }

    await GroupChatParticipant.deleteOne({
      chat_id: chatId,
      user_id: userIdToRemove,
    });

    return chat;
  };

  // Find existing 1:1 chat for friends
  getChatByUserIds = async (userA: string, userB: string) => {
    const rel = await Friend.findOne({
      user_id: userA,
      friend_id: userB,
      friendship_type: FriendshipType.ACCEPTED,
    });
    if (!rel?.chat_id)
      throw new GraphQLError('No chat found for these friends');

    const chat = await Chat.findById(rel.chat_id);
    if (!chat) throw new GraphQLError('Chat not found');

    return chat;
  };

  getAllChatsForUser = async (userId: string) => {
    const chats = await Chat.find({
      participant_ids: userId, // Check if the user is a participant
    });
    return chats;
  };

  // Get all group chats for a specific user
  getAllGroupsForUser = async (userId: string) => {
    const groupParticipants = await GroupChatParticipant.find({
      user_id: userId, // Check if the user is a participant in any group
    });

    const groupChatIds = groupParticipants.map(
      (participant) => participant.chat_id
    );

    const groupChats = await GroupChat.find({
      _id: { $in: groupChatIds }, // Fetch all group chats the user is part of
    });

    return groupChats;
  };
}
