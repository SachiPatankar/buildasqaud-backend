import gql from 'graphql-tag';

const typeDefs = gql`
  enum FriendStatus {
    REQUESTED
    INCOMING
    FRIEND
  }

  enum FriendshipType {
    BLOCKED
    PENDING
    ACCEPTED
  }

  type Friend {
    _id: String!
    user_id: String!
    friend_id: String!
    status: FriendStatus!
    friendship_type: FriendshipType!
    created_at: String!
    updated_at: String!
  }

  extend type Mutation {
    sendFriendRequest(toUserId: String!): Friend!
    respondToRequest(requestId: String!, accept: Boolean!): Friend!
    cancelFriendRequest(requestId: String!): Boolean!
    removeFriend(friendshipId: String!): Boolean!
  }
`;

export default typeDefs;
