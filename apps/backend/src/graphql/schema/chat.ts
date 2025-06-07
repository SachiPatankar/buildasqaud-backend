import gql from 'graphql-tag';

const typeDefs = gql`
  type Message {
    _id: String!
    chat_id: String!
    sender_id: String!
    message: String!
    read_status: Boolean!
    created_at: String!
    updated_at: String!
  }

  type Chat {
    _id: String!
    participant_ids: [String!]
    is_group: Boolean!
    created_at: String!
    updated_at: String!
  }

    type GroupChat {
    _id: String!
    name: String!
    is_group: Boolean!
    created_at: String!
    updated_at: String!
  }


  extend type Query {
    loadPreviousMessages(
      chatId: String!
      limit: Int = 20
      before: String
    ): [Message!]!
    oneToOneChat(otherUserId: String!): Chat!
    getAllChatsForUser: [Chat!]!
    getAllGroupsForUser: [GroupChat!]!
  }

  extend type Mutation {
    sendMessage(chatId: String!, content: String!): Message!
    deleteMessageForEveryone(messageId: String!): Boolean!
    deleteMessageForMe(messageId: String!): Boolean!

    createChat(participantIds: [String!]!): Chat!
    createGroup(name: String!, participantIds: [String!]!): Chat!
    addToChat(chatId: String!, userId: String!): Chat!
    removeFromChat(chatId: String!, userId: String!): Chat!
  }
`;

export default typeDefs;
