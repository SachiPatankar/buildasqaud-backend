import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Link {
    name: String!
    url: String!
  }

  type User {
    _id: String!
    first_name: String!
    last_name: String
    email: String!
    photo: String
    title: String
    bio: String
    location_id: String
    connections_count: Int
    links: [Link]
    is_online: Boolean
    is_connection: String
    chat_id: String
    last_seen: Date
    created_at: Date!
    updated_at: Date!
  }

  input CreateUserInput {
    email: String!
    first_name: String!
    last_name: String
    password: String
    googleId: String
    githubId: String
  }

  input UpdateUserInput {
    first_name: String
    last_name: String
    photo: String
    title: String
    bio: String
    location_id: String
    links: [LinkInput]
  }

  input LinkInput {
    name: String!
    url: String!
  }

  extend type Query {
    loadUserById(userId: String): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(userId: String!): Boolean!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
  }
`;

export default typeDefs;
