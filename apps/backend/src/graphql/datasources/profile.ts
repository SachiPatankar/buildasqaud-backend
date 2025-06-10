import { IProfileDataSource } from './types';
import {
  AchievementModel,
  EducationModel,
  ExperienceModel,
  ProjectModel,
  UserSkillModel,
} from '@db'; // Assuming models are in @db

import { 
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

export default class ProfileDataSource implements IProfileDataSource {

  // ACHIEVEMENT DATA SOURCE METHODS
  async createAchievement(userId: string, input: CreateAchievementInput) {
    const newAchievement = new AchievementModel({
      ...input,
      user_id: userId,
    });
    return newAchievement.save();
  }

  async updateAchievement(achievementId: string, input: UpdateAchievementInput) {
    return AchievementModel.findByIdAndUpdate(achievementId, input, { new: true });
  }

  async deleteAchievement(achievementId: string) {
    await AchievementModel.findByIdAndDelete(achievementId);
    return true;
  }

  async getAchievementsByUser(userId: string) {
    return AchievementModel.find({ user_id: userId });
  }

  // EDUCATION DATA SOURCE METHODS
  async createEducation(userId: string, input: CreateEducationInput) {
    const newEducation = new EducationModel({
      ...input,
      user_id: userId,
    });
    return newEducation.save();
  }

  async updateEducation(educationId: string, input: UpdateEducationInput) {
    return EducationModel.findByIdAndUpdate(educationId, input, { new: true });
  }

  async deleteEducation(educationId: string) {
    await EducationModel.findByIdAndDelete(educationId);
    return true;
  }

  async getEducationByUser(userId: string) {
    return EducationModel.find({ user_id: userId });
  }

  // EXPERIENCE DATA SOURCE METHODS
  async createExperience(userId: string, input: CreateExperienceInput) {
    const newExperience = new ExperienceModel({
      ...input,
      user_id: userId,
    });
    return newExperience.save();
  }

  async updateExperience(experienceId: string, input: UpdateExperienceInput) {
    return ExperienceModel.findByIdAndUpdate(experienceId, input, { new: true });
  }

  async deleteExperience(experienceId: string) {
    await ExperienceModel.findByIdAndDelete(experienceId);
    return true;
  }

  async getExperienceByUser(userId: string) {
    return ExperienceModel.find({ user_id: userId });
  }

  // PROJECT DATA SOURCE METHODS
  async createProject(userId: string, input: CreateProjectInput) {
    const newProject = new ProjectModel({
      ...input,
      user_id: userId,
    });
    return newProject.save();
  }

  async updateProject(projectId: string, input: UpdateProjectInput) {
    return ProjectModel.findByIdAndUpdate(projectId, input, { new: true });
  }

  async deleteProject(projectId: string) {
    await ProjectModel.findByIdAndDelete(projectId);
    return true;
  }

  async getProjectsByUser(userId: string) {
    return ProjectModel.find({ user_id: userId });
  }

  // USER SKILLS DATA SOURCE METHODS
  async createUserSkill(userId: string, input: CreateUserSkillInput) {
    const newUserSkill = new UserSkillModel({
      ...input,
      user_id: userId,
    });
    return newUserSkill.save();
  }

  async updateUserSkill(userSkillId: string, input: UpdateUserSkillInput) {
    return UserSkillModel.findByIdAndUpdate(userSkillId, input, { new: true });
  }

  async deleteUserSkill(userSkillId: string) {
    await UserSkillModel.findByIdAndDelete(userSkillId);
    return true;
  }

  async getSkillsByUser(userId: string) {
    return UserSkillModel.find({ user_id: userId });
  }
}
