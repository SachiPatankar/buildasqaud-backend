import { ApolloContext } from '../types';
import {
  Achievement,
  Education,
  Experience,
  Project,
  UserSkill,
  CreateAchievementInput,
  UpdateAchievementInput,
  CreateEducationInput,
  UpdateEducationInput,
  CreateExperienceInput,
  UpdateExperienceInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateUserSkillInput,
  UpdateUserSkillInput,
} from '../../types/generated'; // Import generated types

const resolvers = {
  Query: {
    getAchievementsByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Achievement[]> => {
      return context.dataSources.profile.getAchievementsByUser(userId);
    },
    getEducationByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Education[]> => {
      return context.dataSources.profile.getEducationByUser(userId);
    },
    getExperienceByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Experience[]> => {
      return context.dataSources.profile.getExperienceByUser(userId);
    },
    getProjectsByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<Project[]> => {
      return context.dataSources.profile.getProjectsByUser(userId);
    },
    getSkillsByUser: async (
      _: any,
      { userId }: { userId: string },
      context: ApolloContext
    ): Promise<UserSkill[]> => {
      return context.dataSources.profile.getSkillsByUser(userId);
    },
  },

  Mutation: {
    createAchievement: async (
      _: any,
      { userId, input }: { userId: string; input: CreateAchievementInput },
      context: ApolloContext
    ): Promise<Achievement> => {
      return context.dataSources.profile.createAchievement(userId, input);
    },
    updateAchievement: async (
      _: any,
      {
        achievementId,
        input,
      }: { achievementId: string; input: UpdateAchievementInput },
      context: ApolloContext
    ): Promise<Achievement> => {
      return context.dataSources.profile.updateAchievement(
        achievementId,
        input
      );
    },
    deleteAchievement: async (
      _: any,
      { achievementId }: { achievementId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.profile.deleteAchievement(achievementId);
    },

    createEducation: async (
      _: any,
      { userId, input }: { userId: string; input: CreateEducationInput },
      context: ApolloContext
    ): Promise<Education> => {
      return context.dataSources.profile.createEducation(userId, input);
    },
    updateEducation: async (
      _: any,
      {
        educationId,
        input,
      }: { educationId: string; input: UpdateEducationInput },
      context: ApolloContext
    ): Promise<Education> => {
      return context.dataSources.profile.updateEducation(educationId, input);
    },
    deleteEducation: async (
      _: any,
      { educationId }: { educationId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.profile.deleteEducation(educationId);
    },

    createExperience: async (
      _: any,
      { userId, input }: { userId: string; input: CreateExperienceInput },
      context: ApolloContext
    ): Promise<Experience> => {
      return context.dataSources.profile.createExperience(userId, input);
    },
    updateExperience: async (
      _: any,
      {
        experienceId,
        input,
      }: { experienceId: string; input: UpdateExperienceInput },
      context: ApolloContext
    ): Promise<Experience> => {
      return context.dataSources.profile.updateExperience(experienceId, input);
    },
    deleteExperience: async (
      _: any,
      { experienceId }: { experienceId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.profile.deleteExperience(experienceId);
    },

    createProject: async (
      _: any,
      { userId, input }: { userId: string; input: CreateProjectInput },
      context: ApolloContext
    ): Promise<Project> => {
      return context.dataSources.profile.createProject(userId, input);
    },
    updateProject: async (
      _: any,
      { projectId, input }: { projectId: string; input: UpdateProjectInput },
      context: ApolloContext
    ): Promise<Project> => {
      return context.dataSources.profile.updateProject(projectId, input);
    },
    deleteProject: async (
      _: any,
      { projectId }: { projectId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.profile.deleteProject(projectId);
    },

    createUserSkill: async (
      _: any,
      { userId, input }: { userId: string; input: CreateUserSkillInput },
      context: ApolloContext
    ): Promise<UserSkill> => {
      return context.dataSources.profile.createUserSkill(userId, input);
    },
    updateUserSkill: async (
      _: any,
      {
        userSkillId,
        input,
      }: { userSkillId: string; input: UpdateUserSkillInput },
      context: ApolloContext
    ): Promise<UserSkill> => {
      return context.dataSources.profile.updateUserSkill(userSkillId, input);
    },
    deleteUserSkill: async (
      _: any,
      { userSkillId }: { userSkillId: string },
      context: ApolloContext
    ): Promise<boolean> => {
      return context.dataSources.profile.deleteUserSkill(userSkillId);
    },
  },
};

export default resolvers;
