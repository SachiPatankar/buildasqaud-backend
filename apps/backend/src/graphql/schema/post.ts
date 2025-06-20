// graphql/schemas/post.ts
import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Requirement {
    desired_skills: [String]
    desired_roles: [String]
  }

  type Post {
    _id: String!
    title: String!
    description: String
    posted_by: String!
    requirements: Requirement
    tech_stack: [String]
    project_phase: String
    project_type: String
    work_mode: String
    experience_level: String
    location_id: String
    status: String!
    views_count: Int!
    applications_count: Int!
    created_at: Date!
    updated_at: Date!
  }

    type PostSummary {
    _id: String!
    title: String!
    description: String
    posted_by: String!
    first_name: String!
    last_name: String
    photo: String
    tech_stack: [String]
    work_mode: String
    experience_level: String
    location_id: String
    status: String!
    views_count: Int!
    applications_count: Int!
    is_saved: Boolean!
    is_applied: Boolean!
    created_at: Date!
    updated_at: Date!
  }

  type PostDetails {
    _id: String!
    title: String!
    description: String
    posted_by: String!
    first_name: String!
    last_name: String
    photo: String
    tech_stack: [String]
    work_mode: String
    experience_level: String
    location_id: String
    status: String!
    views_count: Int!
    applications_count: Int!
    requirements: Requirement
    project_phase: String
    project_type: String
    is_saved: Boolean!
    is_applied: Boolean!
    created_at: Date!
    updated_at: Date!
  }

  type SavedPost {
    _id: String!
    user_id: String!
    post_id: String!
    created_at: Date!
  }

  extend type Query {
    loadPosts(page: Int, limit: Int): [PostSummary]!
    loadPostById(postId: String!): PostDetails
    loadPostByFilter(filter: PostFilterInput!): [PostSummary]!
    getSavedPosts(userId: String!): [SavedPost]!
  }

  input PostFilterInput {
    status: String
    project_type: String
    work_mode: String
    project_phase: String
    tech_stack: [String]
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(postId: String!, input: UpdatePostInput!): Post!
    deletePost(postId: String!): Boolean!
    incrementPostView(postId: String!): Post!
    savePost(postId: String!): SavedPost!
    unsavePost(postId: String!): Boolean!
    closePost(postId: String!): Post!
  }

  input CreatePostInput {
    title: String!
    description: String
    requirements: RequirementInput
    tech_stack: [String]
    project_phase: String
    project_type: String
    work_mode: String
    location_id: String
  }

  input RequirementInput {
    desired_skills: [String]
    desired_roles: [String]
    preferred_experience: String
  }

  input UpdatePostInput {
    title: String!
    description: String
    requirements: RequirementInput
    tech_stack: [String]
    project_phase: String
    project_type: String
    work_mode: String
    status: String
  }
`;

export default typeDefs;
