import gql from 'graphql-tag';

const typeDefs = gql`
  type Link {
    name: String!
    link: String!
  }

  type Profile {
    _id: String!
    user_id: String!
    title: String
    bio: String
    college: String
    branch: String
    year: String
    links: [Link!]!
    location_id: String
    created_at: String
    updated_at: String
  }

  input LinkInput {
    name: String!
    link: String!
  }
  input UpdateProfileInput {
    title: String
    bio: String
    college: String
    branch: String
    year: String
    links: [LinkInput!]
    location_id: String
  }

  extend type Query {
    getProfileById(id: String!): Profile
    getCurrentUserProfile: Profile
  }

  extend type Mutation {
    updateCurrentUserProfile(input: UpdateProfileInput!): Profile!
  }
`;

export default typeDefs;
