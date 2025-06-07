import gql from 'graphql-tag';

const typeDefs = gql`
  extend type Mutation {
    interested(hackathonId: String!): Hackathon!
    uninterested(hackathonId: String!): Hackathon!
  }
`;

export default typeDefs;
