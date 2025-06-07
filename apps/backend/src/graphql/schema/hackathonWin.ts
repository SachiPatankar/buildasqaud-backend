import gql from 'graphql-tag';

const typeDefs = gql`
  type HackathonWin {
    _id: String!
    title: String!
    rank: String
    description: String
    profile_id: String!
    created_at: String
    updated_at: String
  }

  input CreateHackathonWinInput {
    title: String!
    rank: String
    description: String
  }

  input UpdateHackathonWinInput {
    id: String!
    title: String
    rank: String
    description: String
  }

  extend type Query {
    getAllHackathonWinsByProfileId(profileId: String!): [HackathonWin!]!
    getCurrentUserHackathonWins: [HackathonWin!]!
  }

  extend type Mutation {
    createHackathonWin(input: CreateHackathonWinInput!): HackathonWin!
    updateHackathonWinByID(input: UpdateHackathonWinInput!): HackathonWin!
    deleteHackathonWinByID(id: String!): Boolean!
  }
`;

export default typeDefs;
