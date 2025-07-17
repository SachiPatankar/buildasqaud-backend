import {
  CreatePostInput,
  UpdatePostInput,
  PostFilterInput,
  Post,
  PostSummary,
  PostDetails,
} from '../../types/generated';
import { SavedPost } from '../../types/generated';
import {
  Application,
  ApplicationsByPostIdResponse,
  ApplicationsByUserIdResponse,
} from '../../types/generated';
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
import { User, CreateUserInput, UpdateUserInput } from '../../types/generated';
import { Person, PeopleFilterInput } from '../../types/generated';
import { Message, Chat } from '../../types/generated'; // Generated types from codegen

export interface IDataSource {
  user: IUserDataSource;
  s3: IS3DataSource;
  post: IPostDataSource; // Post data source
  savedPost: ISavedPostDataSource; // Saved post data source
  application: IApplicationDataSource; // Application data source
  profile: IProfileDataSource; // Profile data source
  connection: IConnectionDataSource; // Connection data source
  people: IPeopleDataSource; // People data source
  chat: IChatDataSource; // Chat data source
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

export interface IUserDataSource {
  createUser(input: CreateUserInput): Promise<User>; // Create a new user
  updateUser(input: UpdateUserInput, userId: string): Promise<User>; // Update an existing user by ID
  deleteUser(userId: string): Promise<boolean>; // Delete a user by ID
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean>; // Change a user's password
  loadUserById(userId: string, current_user_id?: string): Promise<User | null>; // Fetch a user by their ID, with optional current user context
}

export interface IPostDataSource {
  loadPosts(
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]>;
  loadPostById(
    postId: string,
    current_user_id: string
  ): Promise<PostDetails | null>;
  loadPostByFilter(
    filter: PostFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]>;
  loadPostsByUserId(userId: string): Promise<PostSummary[]>;
  createPost(input: CreatePostInput, postedBy: string): Promise<Post>;
  updatePost(postId: string, input: UpdatePostInput): Promise<Post | null>;
  deletePost(postId: string): Promise<boolean>;
  incrementPostView(postId: string): Promise<Post>;
  closePost(postId: string): Promise<Post>;
  openPost(postId: string): Promise<Post>;
  loadByRecommendation(
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]>;
  searchProjects(search: string, current_user_id: string): Promise<PostSummary[]>;
}

export interface ISavedPostDataSource {
  getSavedPosts(userId: string): Promise<PostSummary[]>;
  savePost(postId: string, userId: string): Promise<SavedPost>;
  unsavePost(postId: string, userId: string): Promise<boolean>;
}

export interface IApplicationDataSource {
  loadApplicationsByPostId(
    postId: string,
    current_user_id?: string
  ): Promise<ApplicationsByPostIdResponse[]>;
  getApplicationsByUser(
    userId: string
  ): Promise<ApplicationsByUserIdResponse[]>;
  applyToPost(
    postId: string,
    applicantId: string,
    message: string
  ): Promise<Application>;
  cancelApplyToPost(applicationId: string): Promise<boolean>;
  updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<Application>;
  searchMyApplications(userId: string, search: string): Promise<ApplicationsByUserIdResponse[]>;
}

export interface IProfileDataSource {
  // ACHIEVEMENT DATA SOURCE METHODS
  createAchievement(
    userId: string,
    input: CreateAchievementInput
  ): Promise<Achievement>;
  updateAchievement(
    achievementId: string,
    input: UpdateAchievementInput
  ): Promise<Achievement>;
  deleteAchievement(achievementId: string): Promise<boolean>;
  getAchievementsByUser(userId: string): Promise<Achievement[]>;

  // EDUCATION DATA SOURCE METHODS
  createEducation(
    userId: string,
    input: CreateEducationInput
  ): Promise<Education>;
  updateEducation(
    educationId: string,
    input: UpdateEducationInput
  ): Promise<Education>;
  deleteEducation(educationId: string): Promise<boolean>;
  getEducationByUser(userId: string): Promise<Education[]>;

  // EXPERIENCE DATA SOURCE METHODS
  createExperience(
    userId: string,
    input: CreateExperienceInput
  ): Promise<Experience>;
  updateExperience(
    experienceId: string,
    input: UpdateExperienceInput
  ): Promise<Experience>;
  deleteExperience(experienceId: string): Promise<boolean>;
  getExperienceByUser(userId: string): Promise<Experience[]>;

  // PROJECT DATA SOURCE METHODS
  createProject(userId: string, input: CreateProjectInput): Promise<Project>;
  updateProject(projectId: string, input: UpdateProjectInput): Promise<Project>;
  deleteProject(projectId: string): Promise<boolean>;
  getProjectsByUser(userId: string): Promise<Project[]>;

  // USER SKILLS DATA SOURCE METHODS
  createUserSkill(
    userId: string,
    input: CreateUserSkillInput
  ): Promise<UserSkill>;
  updateUserSkill(
    userSkillId: string,
    input: UpdateUserSkillInput
  ): Promise<UserSkill>;
  deleteUserSkill(userSkillId: string): Promise<boolean>;
  getSkillsByUser(userId: string): Promise<UserSkill[]>;
}

export interface IConnectionDataSource {
  sendFriendReq(
    requesterUserId: string,
    addresseeUserId: string,
    message: string
  ): Promise<Connection>;
  acceptFriendReq(connectionId: string): Promise<Connection>;
  declineFriendReq(connectionId: string): Promise<boolean>;
  blockUser(
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<Connection>;
  removeConnection(connectionId: string): Promise<boolean>;
  loadConnectionsList(userId: string): Promise<Connection[]>;
  loadPendingFriendRequests(userId: string): Promise<Connection[]>;
  loadSentFriendRequests(userId: string): Promise<Connection[]>;
  checkConnectionStatus(
    requesterUserId: string,
    addresseeUserId: string
  ): Promise<string>;
}

export interface IPeopleDataSource {
  loadPeople(
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]>; // Load a list of people with limited fields
  loadPeopleByFilter(
    filter: PeopleFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]>; // Load people based on filters
  loadPersonById(id: string): Promise<Person>; // Load a single person by ID
  searchPeople(search: string, current_user_id: string): Promise<Person[]>;
}

export interface IChatDataSource {
  sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<Message>;
  editMessage(
    messageId: string,
    content: string,
    userId: string
  ): Promise<Message>;
  deleteMessage(
    messageId: string,
    userId: string,
    forAll?: boolean
  ): Promise<boolean>;
  getMessagesForChat(
    chatId: string,
    page: number,
    limit: number
  ): Promise<Message[]>;
  getChatListForUser(userId: string): Promise<Chat[]>;
  getChatIdsForUser(userId: string): Promise<string[]>;
  getUnreadCountForChats(
    userId: string
  ): Promise<{ chat_id: string; unread_count: number }[]>;
  markMessagesAsRead(chatId: string, userId: string): Promise<boolean>;
  getInitialCounts(userId: string): Promise<{
    totalUnread: number;
    chatCounts: Record<string, number>;
    friendRequestCount: number;
  }>;
}
