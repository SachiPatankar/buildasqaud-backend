import gql from 'graphql-tag';

const typeDefs = gql`
  enum HackathonState {
    LIVE
    UPCOMING
    PAST
  }

  type Hackathon {
    id: String!
    title: String!
    description: String
    location_id: String
    url: String
    creator_id: String!
    interestedCount: Int!
    created_at: String
    updated_at: String
  }

  input CreateHackathonInput {
    title: String!
    description: String
    location_id: String
    url: String
  }

  input UpdateHackathonInput {
    id: String!
    title: String
    description: String
    location_id: String
    url: String
  }

  extend type Query {
    getAllHackathons(page: Int, limit: Int): [Hackathon!]!
    getHackathonById(id: String!): Hackathon
  }

  extend type Mutation {
    createHackathon(input: CreateHackathonInput!): Hackathon!
    updateHackathon(input: UpdateHackathonInput!): Hackathon!
    interested(hackathonId: String!): Hackathon!
    uninterested(hackathonId: String!): Hackathon!
  }
`;

export default typeDefs;
