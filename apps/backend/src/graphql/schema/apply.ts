import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Application {
    _id: String!
    post_id: String!
    applicant_id: String!
    message: String
    status: String!
    created_at: Date!
    updated_at: Date!
  }

  type ApplicationsByPostIdResponse {
    _id: String!
    post_id: String!
    applicant_id: String!
    first_name: String!
    last_name: String
    photo: String
    location_id: String
    title: String
    bio: String
    top_skills: [UserSkill]
    is_connection: String
    message: String
    status: String!
    created_at: Date!
    updated_at: Date!
  }

  type ApplicationsByUserIdResponse {
    post: PostSummary!
    application: Application!
  }

  extend type Query {
    loadApplicationsByPostId(postId: String!): [ApplicationsByPostIdResponse]!
    getApplicationsByUser: [ApplicationsByUserIdResponse]!
  }

  extend type Mutation {
    applyToPost(postId: String!, message: String): Application!
    cancelApplyToPost(applicationId: String!): Boolean!
    updateApplicationStatus(
      applicationId: String!
      status: String!
    ): Application!
  }
`;

export default typeDefs;
