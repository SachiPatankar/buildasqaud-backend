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

  extend type Query {
    loadApplicationsByPostId(postId: String!): [Application]!
    getApplicationsByUser(userId: String!): [Application]!
  }

  extend type Mutation {
    applyToPost(
      postId: String!
      applicantId: String!
      message: String
    ): Application!
    cancelApplyToPost(applicationId: String!): Boolean!
    updateApplicationStatus(
      applicationId: String!
      status: String!
    ): Application!
  }
`;

export default typeDefs;
