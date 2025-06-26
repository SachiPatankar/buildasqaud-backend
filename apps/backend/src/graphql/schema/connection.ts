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
    first_name: String
    last_name: String
    photo: String
  }

  extend type Query {
    loadConnectionsList(userId: String): [Connection]!
    loadPendingFriendRequests: [Connection]!
    loadSentFriendRequests: [Connection]!
    checkConnectionStatus(
      addresseeUserId: String!
    ): String!
  }

  extend type Mutation {
    sendFriendReq(
      addresseeUserId: String!
      message: String
    ): Connection!
    acceptFriendReq(connectionId: String!): Connection!
    declineFriendReq(connectionId: String!): Boolean!
    blockUser(addresseeUserId: String!): Connection!
    removeConnection(connectionId: String!): Boolean!
  }
`;

export default typeDefs;
