import gql from 'graphql-tag';

const typeDefs = gql`
  type Project {
    _id: String!
    title: String!
    description: String
    link: String
    profile_id: String!
    created_at: String
    updated_at: String
  }

  input CreateProjectInput {
    title: String!
    description: String
    link: String
  }

  input UpdateProjectInput {
    id: String!
    title: String
    description: String
    link: String
  }

  extend type Query {
    getAllProjectsByProfileId(profileId: String!): [Project!]!
    getCurrentUserProjects: [Project!]!
  }

  extend type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProjectByID(input: UpdateProjectInput!): Project!
    deleteProjectByID(id: String!): Boolean!
  }
`;

export default typeDefs;
