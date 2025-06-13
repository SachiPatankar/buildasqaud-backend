import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Message {
    _id: String!
    chat_id: String!
    sender_id: String!
    content: String!
    read_by: [ReadStatus]
    edited_at: Date
    is_deleted: Boolean
    deleted_for: [String]
    reply_to_message_id: String
    created_at: Date!
    updated_at: Date!
  }

  type ReadStatus {
    user_id: String!
    read_at: Date!
  }

  type Chat {
    _id: String!
    participant_ids: [String!]!
    last_message_id: String
    last_message_at: Date
    is_active: Boolean
    created_at: Date!
    updated_at: Date!
  }
    input SendMessageInput {
    chatId: String!
    senderId: String!
    content: String!
  }

  input EditMessageInput {
    messageId: String!
    content: String!
  }

  input DeleteMessageInput {
    messageId: String!
  }

  extend type Query {
    getMessagesForChat(chatId: String!, page: Int, limit: Int): [Message]!
    getChatListForUser(userId: String!): [Chat]!
    getUnreadCountForChats(userId: String!): [UnreadChatCount]!
  }

  extend type Mutation {
    sendMessage(chatId: String!, senderId: String!, content: String!): Message!
    editMessage(messageId: String!, content: String!): Message!
    deleteMessage(messageId: String!): Boolean!
  }

  type UnreadChatCount {
    chat_id: String!
    unread_count: Int!
  }
`;

export default typeDefs;
