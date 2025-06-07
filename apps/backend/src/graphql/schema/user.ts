import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    _id: String!
    first_name: String
    last_name: String
    photo: String
  }

  input UpdateUserInput {
    first_name: String
    last_name: String
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    updateUserPhoto(photoUrl: String!): User!
    deletePhoto: User!
  }
`;

export default typeDefs;
