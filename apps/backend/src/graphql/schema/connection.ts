import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Connection {
    _id: String!
    requester_user_id: String!
    addressee_user_id: String!
    status: String!
    message: String
    chat_id: String
    created_at: Date!
    updated_at: Date!
    responded_at: Date
  }

  extend type Query {
    loadConnectionsList(userId: String!): [Connection]!
    loadPendingFriendRequests(userId: String!): [Connection]!
    loadSentFriendRequests(userId: String!): [Connection]!
    checkConnectionStatus(
      requesterUserId: String!
      addresseeUserId: String!
    ): String!
  }

  extend type Mutation {
    sendFriendReq(
      requesterUserId: String!
      addresseeUserId: String!
      message: String
    ): Connection!
    acceptFriendReq(connectionId: String!): Connection!
    declineFriendReq(connectionId: String!): Boolean!
    blockUser(requesterUserId: String!, addresseeUserId: String!): Connection!
    removeConnection(connectionId: String!): Boolean!
  }
`;

export default typeDefs;
