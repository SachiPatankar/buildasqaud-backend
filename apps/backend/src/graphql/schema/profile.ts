import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Achievement {
    _id: String!
    title: String!
    description: String
    user_id: String!
    order: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateAchievementInput {
    title: String!
    description: String
    order: Int
  }

  input UpdateAchievementInput {
    title: String
    description: String
    order: Int
  }

  extend type Query {
    getAchievementsByUser(userId: String): [Achievement]!
  }

  extend type Mutation {
    createAchievement(
      input: CreateAchievementInput!
    ): Achievement!
    updateAchievement(
      achievementId: String!
      input: UpdateAchievementInput!
    ): Achievement!
    deleteAchievement(achievementId: String!): Boolean!
  }

  type Education {
    _id: String!
    user_id: String!
    institution_name: String!
    location_id: String
    degree: String!
    field_of_study: String!
    start_date: Date!
    end_date: Date
    is_current: Boolean!
    grade: String
    description: String
    order: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateEducationInput {
    institution_name: String!
    degree: String!
    field_of_study: String!
    start_date: Date!
    end_date: Date
    is_current: Boolean!
    grade: String
    description: String
    location_id: String
    order: Int
  }

  input UpdateEducationInput {
    institution_name: String
    degree: String
    field_of_study: String
    start_date: Date
    end_date: Date
    is_current: Boolean
    grade: String
    description: String
    location_id: String
    order: Int
  }

  extend type Query {
    getEducationByUser(userId: String): [Education]!
  }

  extend type Mutation {
    createEducation(input: CreateEducationInput!): Education!
    updateEducation(
      educationId: String!
      input: UpdateEducationInput!
    ): Education!
    deleteEducation(educationId: String!): Boolean!
  }

  type Experience {
    _id: String!
    user_id: String!
    company_name: String!
    position: String!
    start_date: Date!
    end_date: Date
    is_current: Boolean!
    description: String
    location_id: String
    employment_type: String
    order: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateExperienceInput {
    company_name: String!
    position: String!
    start_date: Date!
    end_date: Date
    is_current: Boolean!
    description: String
    location_id: String
    employment_type: String
    order: Int
  }

  input UpdateExperienceInput {
    company_name: String
    position: String
    start_date: Date
    end_date: Date
    is_current: Boolean
    description: String
    location_id: String
    employment_type: String
    order: Int
  }

  extend type Query {
    getExperienceByUser(userId: String): [Experience]!
  }

  extend type Mutation {
    createExperience(input: CreateExperienceInput!): Experience!
    updateExperience(
      experienceId: String!
      input: UpdateExperienceInput!
    ): Experience!
    deleteExperience(experienceId: String!): Boolean!
  }

  type Project {
    _id: String!
    user_id: String!
    title: String!
    description: String
    technologies: [String]
    project_url: String
    github_url: String
    start_date: Date
    end_date: Date
    is_current: Boolean
    order: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateProjectInput {
    title: String!
    description: String
    technologies: [String]
    project_url: String
    github_url: String
    start_date: Date
    end_date: Date
    is_current: Boolean
    order: Int
  }

  input UpdateProjectInput {
    title: String
    description: String
    technologies: [String]
    project_url: String
    github_url: String
    start_date: Date
    end_date: Date
    is_current: Boolean
    order: Int
  }

  extend type Query {
    getProjectsByUser(userId: String): [Project]!
  }

  extend type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(projectId: String!, input: UpdateProjectInput!): Project!
    deleteProject(projectId: String!): Boolean!
  }

  type UserSkill {
    _id: String!
    user_id: String!
    skill_name: String!
    proficiency_level: String!
    years_experience: Int
    order: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateUserSkillInput {
    skill_name: String!
    proficiency_level: String!
    years_experience: Int
    order: Int
  }

  input UpdateUserSkillInput {
    skill_name: String
    proficiency_level: String
    years_experience: Int
    order: Int
  }

  extend type Query {
    getSkillsByUser(userId: String): [UserSkill]!
  }

  extend type Mutation {
    createUserSkill(input: CreateUserSkillInput!): UserSkill!
    updateUserSkill(
      userSkillId: String!
      input: UpdateUserSkillInput!
    ): UserSkill!
    deleteUserSkill(userSkillId: String!): Boolean!
  }
`;

export default typeDefs;
