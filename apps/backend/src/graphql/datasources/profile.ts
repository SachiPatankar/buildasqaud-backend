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
  createAchievement = async (userId: string, input: CreateAchievementInput) => {
    let order = input.order;
    if (order === undefined || order === null) {
      const last = await AchievementModel.findOne({ user_id: userId }).sort({
        order: -1,
      });
      order = last ? last.order + 1 : 0;
    }
    const newAchievement = new AchievementModel({
      ...input,
      user_id: userId,
      order,
    });
    return newAchievement.save();
  };

  updateAchievement = async (
    achievementId: string,
    input: UpdateAchievementInput
  ) => {
    return AchievementModel.findByIdAndUpdate(achievementId, input, {
      new: true,
    });
  };

  deleteAchievement = async (achievementId: string) => {
    await AchievementModel.findByIdAndDelete(achievementId);
    return true;
  };

  getAchievementsByUser = async (userId: string) => {
    return AchievementModel.find({ user_id: userId });
  };

  createEducation = async (userId: string, input: CreateEducationInput) => {
    let order = input.order;
    if (order === undefined || order === null) {
      const last = await EducationModel.findOne({ user_id: userId }).sort({
        order: -1,
      });
      order = last ? last.order + 1 : 0;
    }
    const newEducation = new EducationModel({
      ...input,
      user_id: userId,
      order,
    });
    return newEducation.save();
  };

  updateEducation = async (
    educationId: string,
    input: UpdateEducationInput
  ) => {
    return EducationModel.findByIdAndUpdate(educationId, input, { new: true });
  };

  deleteEducation = async (educationId: string) => {
    await EducationModel.findByIdAndDelete(educationId);
    return true;
  };

  getEducationByUser = async (userId: string) => {
    return EducationModel.find({ user_id: userId });
  };

  createExperience = async (userId: string, input: CreateExperienceInput) => {
    let order = input.order;
    if (order === undefined || order === null) {
      const last = await ExperienceModel.findOne({ user_id: userId }).sort({
        order: -1,
      });
      order = last ? last.order + 1 : 0;
    }
    const newExperience = new ExperienceModel({
      ...input,
      user_id: userId,
      order,
    });
    return newExperience.save();
  };

  updateExperience = async (
    experienceId: string,
    input: UpdateExperienceInput
  ) => {
    return ExperienceModel.findByIdAndUpdate(experienceId, input, {
      new: true,
    });
  };

  deleteExperience = async (experienceId: string) => {
    await ExperienceModel.findByIdAndDelete(experienceId);
    return true;
  };

  getExperienceByUser = async (userId: string) => {
    return ExperienceModel.find({ user_id: userId });
  };

  createProject = async (userId: string, input: CreateProjectInput) => {
    let order = input.order;
    if (order === undefined || order === null) {
      const last = await ProjectModel.findOne({ user_id: userId }).sort({
        order: -1,
      });
      order = last ? last.order + 1 : 0;
    }
    const newProject = new ProjectModel({
      ...input,
      user_id: userId,
      order,
    });
    return newProject.save();
  };

  updateProject = async (projectId: string, input: UpdateProjectInput) => {
    return ProjectModel.findByIdAndUpdate(projectId, input, { new: true });
  };

  deleteProject = async (projectId: string) => {
    await ProjectModel.findByIdAndDelete(projectId);
    return true;
  };

  getProjectsByUser = async (userId: string) => {
    return ProjectModel.find({ user_id: userId });
  };

  createUserSkill = async (userId: string, input: CreateUserSkillInput) => {
    let order = input.order;
    if (order === undefined || order === null) {
      const last = await UserSkillModel.findOne({ user_id: userId }).sort({
        order: -1,
      });
      order = last ? last.order + 1 : 0;
    }
    const newUserSkill = await new UserSkillModel({
      ...input,
      user_id: userId,
      order,
    }).save();
    const skillObj = newUserSkill.toObject();
    return { ...skillObj, is_top: Boolean(skillObj.is_top) };
  };

  updateUserSkill = async (
    userSkillId: string,
    input: UpdateUserSkillInput
  ) => {
    const updated = await UserSkillModel.findByIdAndUpdate(userSkillId, input, {
      new: true,
    });
    if (!updated) return null;
    const skillObj = updated.toObject();
    return { ...skillObj, is_top: Boolean(skillObj.is_top) };
  };

  deleteUserSkill = async (userSkillId: string) => {
    await UserSkillModel.findByIdAndDelete(userSkillId);
    return true;
  };

  getSkillsByUser = async (userId: string) => {
    const skills = await UserSkillModel.find({ user_id: userId }).lean();
    return skills.map((skill) => ({ ...skill, is_top: Boolean(skill.is_top) }));
  };
}
