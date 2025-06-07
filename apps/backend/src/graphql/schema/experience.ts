import gql from 'graphql-tag';

const typeDefs = gql`
  type Experience {
    _id: String!
    profile_id: String!
    company: String!
    position: String
    duration: String
    location_id: String
    created_at: String
    updated_at: String
  }

  input CreateExperienceInput {
    company: String!
    position: String
    duration: String
    location_id: String
  }

  input UpdateExperienceInput {
    id: String!
    company: String
    position: String
    duration: String
    location_id: String
  }

  extend type Query {
    getAllExperiencesByProfileId(profileId: String!): [Experience!]!
    getCurrentUserExperiences: [Experience!]!
  }

  extend type Mutation {
    createExperience(input: CreateExperienceInput!): Experience!
    updateExperienceByID(input: UpdateExperienceInput!): Experience!
    deleteExperienceByID(id: String!): Boolean!
  }
`;

export default typeDefs;
