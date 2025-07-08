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
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<Achievement[]> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.profile.getAchievementsByUser(id);
    },

    getEducationByUser: async (
      _: any,
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<Education[]> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.profile.getEducationByUser(id);
    },

    getExperienceByUser: async (
      _: any,
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<Experience[]> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.profile.getExperienceByUser(id);
    },

    getProjectsByUser: async (
      _: any,
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<Project[]> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.profile.getProjectsByUser(id);
    },

    getSkillsByUser: async (
      _: any,
      { userId }: { userId?: string },
      context: ApolloContext
    ): Promise<UserSkill[]> => {
      const id = userId || context.currentUser?.id;
      if (!id) throw new Error('Unauthorized');
      return context.dataSources.profile.getSkillsByUser(id);
    },
  },

  Mutation: {
    createAchievement: async (
      _: any,
      { input }: { input: CreateAchievementInput },
      context: ApolloContext
    ): Promise<Achievement> => {
      return context.dataSources.profile.createAchievement(
        context.currentUser.id,
        input
      );
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
      { input }: { input: CreateEducationInput },
      context: ApolloContext
    ): Promise<Education> => {
      return context.dataSources.profile.createEducation(
        context.currentUser.id,
        input
      );
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
      { input }: { input: CreateExperienceInput },
      context: ApolloContext
    ): Promise<Experience> => {
      return context.dataSources.profile.createExperience(
        context.currentUser.id,
        input
      );
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
      { input }: { input: CreateProjectInput },
      context: ApolloContext
    ): Promise<Project> => {
      return context.dataSources.profile.createProject(
        context.currentUser.id,
        input
      );
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
      { input }: { input: CreateUserSkillInput },
      context: ApolloContext
    ): Promise<UserSkill> => {
      return context.dataSources.profile.createUserSkill(
        context.currentUser.id,
        input
      );
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
