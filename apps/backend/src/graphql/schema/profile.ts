import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Achievement {
    _id: String!
    title: String!
    description: String
    user_id: String!
    created_at: Date!
    updated_at: Date!
  }

  input CreateAchievementInput {
    title: String!
    description: String
  }

  input UpdateAchievementInput {
    title: String
    description: String
  }

  extend type Query {
    getAchievementsByUser(userId: String): [Achievement]!
  }

  extend type Mutation {
    createAchievement(
      userId: String
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
    end_date: Date!
    is_current: Boolean!
    grade: String
    description: String
    created_at: Date!
    updated_at: Date!
  }

  input CreateEducationInput {
    institution_name: String!
    degree: String!
    field_of_study: String!
    start_date: Date!
    end_date: Date!
    is_current: Boolean!
    grade: String
    description: String
    location_id: String
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
  }

  extend type Query {
    getEducationByUser(userId: String): [Education]!
  }

  extend type Mutation {
    createEducation(userId: String, input: CreateEducationInput!): Education!
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
    end_date: Date!
    is_current: Boolean!
    description: String
    location_id: String
    employment_type: String
    created_at: Date!
    updated_at: Date!
  }

  input CreateExperienceInput {
    company_name: String!
    position: String!
    start_date: Date!
    end_date: Date!
    is_current: Boolean!
    description: String
    location_id: String
    employment_type: String
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
  }

  extend type Query {
    getExperienceByUser(userId: String): [Experience]!
  }

  extend type Mutation {
    createExperience(
      userId: String
      input: CreateExperienceInput!
    ): Experience!
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
  }

  extend type Query {
    getProjectsByUser(userId: String): [Project]!
  }

  extend type Mutation {
    createProject(userId: String, input: CreateProjectInput!): Project!
    updateProject(projectId: String!, input: UpdateProjectInput!): Project!
    deleteProject(projectId: String!): Boolean!
  }

  type UserSkill {
    _id: String!
    user_id: String!
    skill_name: String!
    proficiency_level: String!
    years_experience: Int
    created_at: Date!
    updated_at: Date!
  }

  input CreateUserSkillInput {
    skill_name: String!
    proficiency_level: String!
    years_experience: Int
  }

  input UpdateUserSkillInput {
    skill_name: String
    proficiency_level: String
    years_experience: Int
  }

  extend type Query {
    getSkillsByUser(userId: String): [UserSkill]!
  }

  extend type Mutation {
    createUserSkill(userId: String, input: CreateUserSkillInput!): UserSkill!
    updateUserSkill(
      userSkillId: String!
      input: UpdateUserSkillInput!
    ): UserSkill!
    deleteUserSkill(userSkillId: String!): Boolean!
  }
`;

export default typeDefs;
