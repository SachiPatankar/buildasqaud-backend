import {
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  Post,
} from '../../types/generated'; 
import { SavedPost } from '../../types/generated';
import { Application } from '../../types/generated';
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
  Education,
  Achievement,
  Experience,
  Project,
  UserSkill,
} from '../../types/generated'; 
import { Connection } from '../../types/generated';

export interface IDataSource {
  user: IUserDataSource;
  s3: IS3DataSource;
  post: IPostDataSource; // Post data source
  savedPost: ISavedPostDataSource; // Saved post data source
  application: IApplicationDataSource; // Application data source
  profile: IProfileDataSource; // Profile data source
  connection: IConnectionDataSource; // Connection data source
}

export interface IUserDataSource {
  getUsers(page?: number, limit?: number): Promise<any>;
  getUserById(userId: string): Promise<any>;
  updateUserPhoto(userId: string, photoUrl: string): Promise<any>;
  deletePhoto(userId: string): Promise<any>;
  updateUser(
    userId: string,
    data: { first_name?: string; last_name?: string }
  ): Promise<any>;
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean>;
}

export interface IS3DataSource {
  getPresignedUrl: (
    fileType: string,
    folder?: string
  ) => Promise<{
    upload_url: string;
    file_url: string;
  }>;
  deleteProfilePhoto: (photoUrl: string) => Promise<boolean>;
}

export interface IPostDataSource {
  loadPosts(page: number, limit: number): Promise<Post[]>;
  loadPostById(postId: string): Promise<Post | null>;
  loadPostByFilter(filter: PostFilterInput): Promise<Post[]>;
  createPost(input: CreatePostInput, postedBy: string): Promise<Post>;
  updatePost(postId: string, input: UpdatePostInput): Promise<Post | null>;
  deletePost(postId: string): Promise<boolean>;
  incrementPostView(postId: string): Promise<Post>;
  closePost(postId: string): Promise<Post>;
}

export interface ISavedPostDataSource {
  getSavedPosts(userId: string): Promise<SavedPost[]>;
  savePost(postId: string, userId: string): Promise<SavedPost>;
  unsavePost(postId: string, userId: string): Promise<boolean>;
}

export interface IApplicationDataSource {
  loadApplicationsByPostId(postId: string): Promise<Application[]>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  applyToPost(postId: string, applicantId: string, message: string): Promise<Application>;
  cancelApplyToPost(applicationId: string): Promise<boolean>;
  updateApplicationStatus(applicationId: string, status: string): Promise<Application>;
}

export interface IProfileDataSource {
  // ACHIEVEMENT DATA SOURCE METHODS
  createAchievement(userId: string, input: CreateAchievementInput): Promise<Achievement>;
  updateAchievement(achievementId: string, input: UpdateAchievementInput): Promise<Achievement>;
  deleteAchievement(achievementId: string): Promise<boolean>;
  getAchievementsByUser(userId: string): Promise<Achievement[]>;

  // EDUCATION DATA SOURCE METHODS
  createEducation(userId: string, input: CreateEducationInput): Promise<Education>;
  updateEducation(educationId: string, input: UpdateEducationInput): Promise<Education>;
  deleteEducation(educationId: string): Promise<boolean>;
  getEducationByUser(userId: string): Promise<Education[]>;

  // EXPERIENCE DATA SOURCE METHODS
  createExperience(userId: string, input: CreateExperienceInput): Promise<Experience>;
  updateExperience(experienceId: string, input: UpdateExperienceInput): Promise<Experience>;
  deleteExperience(experienceId: string): Promise<boolean>;
  getExperienceByUser(userId: string): Promise<Experience[]>;

  // PROJECT DATA SOURCE METHODS
  createProject(userId: string, input: CreateProjectInput): Promise<Project>;
  updateProject(projectId: string, input: UpdateProjectInput): Promise<Project>;
  deleteProject(projectId: string): Promise<boolean>;
  getProjectsByUser(userId: string): Promise<Project[]>;

  // USER SKILLS DATA SOURCE METHODS
  createUserSkill(userId: string, input: CreateUserSkillInput): Promise<UserSkill>;
  updateUserSkill(userSkillId: string, input: UpdateUserSkillInput): Promise<UserSkill>;
  deleteUserSkill(userSkillId: string): Promise<boolean>;
  getSkillsByUser(userId: string): Promise<UserSkill[]>;
}

export interface IConnectionDataSource {
  sendFriendReq(requesterUserId: string, addresseeUserId: string, message: string): Promise<Connection>;
  acceptFriendReq(connectionId: string): Promise<Connection>;
  declineFriendReq(connectionId: string): Promise<boolean>;
  blockUser(requesterUserId: string, addresseeUserId: string): Promise<Connection>;
  removeConnection(connectionId: string): Promise<boolean>;
  loadConnectionsList(userId: string): Promise<Connection[]>;
  loadPendingFriendRequests(userId: string): Promise<Connection[]>;
  loadSentFriendRequests(userId: string): Promise<Connection[]>;
  checkConnectionStatus(requesterUserId: string, addresseeUserId: string): Promise<string>

}
