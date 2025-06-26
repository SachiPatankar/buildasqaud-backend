export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
};

export type Achievement = {
  __typename?: 'Achievement';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
};

export type Application = {
  __typename?: 'Application';
  _id: Scalars['String']['output'];
  applicant_id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  message?: Maybe<Scalars['String']['output']>;
  post_id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
};

export type ApplicationsByPostIdResponse = {
  __typename?: 'ApplicationsByPostIdResponse';
  _id: Scalars['String']['output'];
  applicant_id: Scalars['String']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Date']['output'];
  first_name: Scalars['String']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  post_id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  top_skills?: Maybe<Array<Maybe<UserSkill>>>;
  updated_at: Scalars['Date']['output'];
};

export type ApplicationsByUserIdResponse = {
  __typename?: 'ApplicationsByUserIdResponse';
  application: Application;
  post: PostSummary;
};

export type Chat = {
  __typename?: 'Chat';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  last_message_at?: Maybe<Scalars['Date']['output']>;
  last_message_content?: Maybe<Scalars['String']['output']>;
  last_message_id?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  participant_ids: Array<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Date']['output'];
};

export type Connection = {
  __typename?: 'Connection';
  _id: Scalars['String']['output'];
  addressee_user_id: Scalars['String']['output'];
  chat_id?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Date']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  requester_user_id: Scalars['String']['output'];
  responded_at?: Maybe<Scalars['Date']['output']>;
  status: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
};

export type CreateAchievementInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateEducationInput = {
  degree: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  end_date: Scalars['Date']['input'];
  field_of_study: Scalars['String']['input'];
  grade?: InputMaybe<Scalars['String']['input']>;
  institution_name: Scalars['String']['input'];
  is_current: Scalars['Boolean']['input'];
  location_id?: InputMaybe<Scalars['String']['input']>;
  start_date: Scalars['Date']['input'];
};

export type CreateExperienceInput = {
  company_name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  employment_type?: InputMaybe<Scalars['String']['input']>;
  end_date: Scalars['Date']['input'];
  is_current: Scalars['Boolean']['input'];
  location_id?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['String']['input'];
  start_date: Scalars['Date']['input'];
};

export type CreatePostInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  experience_level?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<RequirementInput>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  github_url?: InputMaybe<Scalars['String']['input']>;
  is_current?: InputMaybe<Scalars['Boolean']['input']>;
  project_url?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
  technologies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  first_name: Scalars['String']['input'];
  githubId?: InputMaybe<Scalars['String']['input']>;
  googleId?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserSkillInput = {
  proficiency_level: Scalars['String']['input'];
  skill_name: Scalars['String']['input'];
  years_experience?: InputMaybe<Scalars['Int']['input']>;
};

export type Education = {
  __typename?: 'Education';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  degree: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  end_date: Scalars['Date']['output'];
  field_of_study: Scalars['String']['output'];
  grade?: Maybe<Scalars['String']['output']>;
  institution_name: Scalars['String']['output'];
  is_current: Scalars['Boolean']['output'];
  location_id?: Maybe<Scalars['String']['output']>;
  start_date: Scalars['Date']['output'];
  updated_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
};

export type Experience = {
  __typename?: 'Experience';
  _id: Scalars['String']['output'];
  company_name: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employment_type?: Maybe<Scalars['String']['output']>;
  end_date: Scalars['Date']['output'];
  is_current: Scalars['Boolean']['output'];
  location_id?: Maybe<Scalars['String']['output']>;
  position: Scalars['String']['output'];
  start_date: Scalars['Date']['output'];
  updated_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
};

export type Link = {
  __typename?: 'Link';
  name: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type LinkInput = {
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  _id: Scalars['String']['output'];
  chat_id: Scalars['String']['output'];
  content: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  deleted_for?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  edited_at?: Maybe<Scalars['Date']['output']>;
  is_deleted?: Maybe<Scalars['Boolean']['output']>;
  read_by?: Maybe<Array<Maybe<ReadStatus>>>;
  reply_to_message_id?: Maybe<Scalars['String']['output']>;
  sender_id: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  acceptFriendReq: Connection;
  applyToPost: Application;
  blockUser: Connection;
  cancelApplyToPost: Scalars['Boolean']['output'];
  changePassword: Scalars['Boolean']['output'];
  closePost: Post;
  createAchievement: Achievement;
  createEducation: Education;
  createExperience: Experience;
  createPost: Post;
  createProject: Project;
  createUser: User;
  createUserSkill: UserSkill;
  declineFriendReq: Scalars['Boolean']['output'];
  deleteAchievement: Scalars['Boolean']['output'];
  deleteEducation: Scalars['Boolean']['output'];
  deleteExperience: Scalars['Boolean']['output'];
  deleteMessage: Scalars['Boolean']['output'];
  deletePost: Scalars['Boolean']['output'];
  deleteProfilePhoto: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteUserSkill: Scalars['Boolean']['output'];
  editMessage: Message;
  incrementPostView: Post;
  openPost: Post;
  removeConnection: Scalars['Boolean']['output'];
  savePost: SavedPost;
  sendFriendReq: Connection;
  sendMessage: Message;
  unsavePost: Scalars['Boolean']['output'];
  updateAchievement: Achievement;
  updateApplicationStatus: Application;
  updateEducation: Education;
  updateExperience: Experience;
  updatePost: Post;
  updateProject: Project;
  updateUser: User;
  updateUserSkill: UserSkill;
};

export type MutationAcceptFriendReqArgs = {
  connectionId: Scalars['String']['input'];
};

export type MutationApplyToPostArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  postId: Scalars['String']['input'];
};

export type MutationBlockUserArgs = {
  addresseeUserId: Scalars['String']['input'];
};

export type MutationCancelApplyToPostArgs = {
  applicationId: Scalars['String']['input'];
};

export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationClosePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationCreateAchievementArgs = {
  input: CreateAchievementInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCreateEducationArgs = {
  input: CreateEducationInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCreateExperienceArgs = {
  input: CreateExperienceInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationCreateUserSkillArgs = {
  input: CreateUserSkillInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDeclineFriendReqArgs = {
  connectionId: Scalars['String']['input'];
};

export type MutationDeleteAchievementArgs = {
  achievementId: Scalars['String']['input'];
};

export type MutationDeleteEducationArgs = {
  educationId: Scalars['String']['input'];
};

export type MutationDeleteExperienceArgs = {
  experienceId: Scalars['String']['input'];
};

export type MutationDeleteMessageArgs = {
  messageId: Scalars['String']['input'];
};

export type MutationDeletePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationDeleteProfilePhotoArgs = {
  photoUrl: Scalars['String']['input'];
};

export type MutationDeleteProjectArgs = {
  projectId: Scalars['String']['input'];
};

export type MutationDeleteUserArgs = {
  userId: Scalars['String']['input'];
};

export type MutationDeleteUserSkillArgs = {
  userSkillId: Scalars['String']['input'];
};

export type MutationEditMessageArgs = {
  content: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
};

export type MutationIncrementPostViewArgs = {
  postId: Scalars['String']['input'];
};

export type MutationOpenPostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationRemoveConnectionArgs = {
  connectionId: Scalars['String']['input'];
};

export type MutationSavePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationSendFriendReqArgs = {
  addresseeUserId: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
};

export type MutationSendMessageArgs = {
  chatId: Scalars['String']['input'];
  content: Scalars['String']['input'];
};

export type MutationUnsavePostArgs = {
  postId: Scalars['String']['input'];
};

export type MutationUpdateAchievementArgs = {
  achievementId: Scalars['String']['input'];
  input: UpdateAchievementInput;
};

export type MutationUpdateApplicationStatusArgs = {
  applicationId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type MutationUpdateEducationArgs = {
  educationId: Scalars['String']['input'];
  input: UpdateEducationInput;
};

export type MutationUpdateExperienceArgs = {
  experienceId: Scalars['String']['input'];
  input: UpdateExperienceInput;
};

export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
  postId: Scalars['String']['input'];
};

export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
  projectId: Scalars['String']['input'];
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserSkillArgs = {
  input: UpdateUserSkillInput;
  userSkillId: Scalars['String']['input'];
};

export type PeopleFilterInput = {
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  skills?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Person = {
  __typename?: 'Person';
  _id: Scalars['String']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  is_connection?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  top_skills?: Maybe<Array<Maybe<UserSkill>>>;
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['String']['output'];
  applications_count: Scalars['Int']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  experience_level?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  posted_by: Scalars['String']['output'];
  project_phase?: Maybe<Scalars['String']['output']>;
  project_type?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Requirement>;
  status: Scalars['String']['output'];
  tech_stack?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  views_count: Scalars['Int']['output'];
  work_mode?: Maybe<Scalars['String']['output']>;
};

export type PostDetails = {
  __typename?: 'PostDetails';
  _id: Scalars['String']['output'];
  applications_count: Scalars['Int']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  experience_level?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  is_applied?: Maybe<Scalars['String']['output']>;
  is_saved: Scalars['Boolean']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  posted_by: Scalars['String']['output'];
  project_phase?: Maybe<Scalars['String']['output']>;
  project_type?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Requirement>;
  status: Scalars['String']['output'];
  tech_stack?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  views_count: Scalars['Int']['output'];
  work_mode?: Maybe<Scalars['String']['output']>;
};

export type PostFilterInput = {
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type PostSummary = {
  __typename?: 'PostSummary';
  _id: Scalars['String']['output'];
  applications_count: Scalars['Int']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  experience_level?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  is_applied?: Maybe<Scalars['String']['output']>;
  is_saved: Scalars['Boolean']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  posted_by: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tech_stack?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  views_count: Scalars['Int']['output'];
  work_mode?: Maybe<Scalars['String']['output']>;
};

export type PresignedUrlResult = {
  __typename?: 'PresignedUrlResult';
  file_url: Scalars['String']['output'];
  upload_url: Scalars['String']['output'];
};

export type Project = {
  __typename?: 'Project';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  end_date?: Maybe<Scalars['Date']['output']>;
  github_url?: Maybe<Scalars['String']['output']>;
  is_current?: Maybe<Scalars['Boolean']['output']>;
  project_url?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['Date']['output']>;
  technologies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  checkConnectionStatus: Scalars['String']['output'];
  getAchievementsByUser: Array<Maybe<Achievement>>;
  getApplicationsByUser: Array<Maybe<ApplicationsByUserIdResponse>>;
  getChatListForUser: Array<Maybe<Chat>>;
  getEducationByUser: Array<Maybe<Education>>;
  getExperienceByUser: Array<Maybe<Experience>>;
  getMessagesForChat: Array<Maybe<Message>>;
  getPresignedUrl: PresignedUrlResult;
  getProjectsByUser: Array<Maybe<Project>>;
  getSavedPosts?: Maybe<Array<Maybe<PostSummary>>>;
  getSkillsByUser: Array<Maybe<UserSkill>>;
  getUnreadCountForChats: Array<Maybe<UnreadChatCount>>;
  loadApplicationsByPostId: Array<Maybe<ApplicationsByPostIdResponse>>;
  loadConnectionsList: Array<Maybe<Connection>>;
  loadPendingFriendRequests: Array<Maybe<Connection>>;
  loadPeople: Array<Maybe<Person>>;
  loadPeopleByFilter: Array<Maybe<Person>>;
  loadPersonById: Person;
  loadPostByFilter: Array<Maybe<PostSummary>>;
  loadPostById?: Maybe<PostDetails>;
  loadPosts: Array<Maybe<PostSummary>>;
  loadPostsByUserId: Array<Maybe<PostSummary>>;
  loadSentFriendRequests: Array<Maybe<Connection>>;
  loadUserById?: Maybe<User>;
};

export type QueryCheckConnectionStatusArgs = {
  addresseeUserId: Scalars['String']['input'];
};

export type QueryGetAchievementsByUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetEducationByUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetExperienceByUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetMessagesForChatArgs = {
  chatId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGetPresignedUrlArgs = {
  fileType: Scalars['String']['input'];
  folder?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetProjectsByUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetSkillsByUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryLoadApplicationsByPostIdArgs = {
  postId: Scalars['String']['input'];
};

export type QueryLoadConnectionsListArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryLoadPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryLoadPeopleByFilterArgs = {
  filter: PeopleFilterInput;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryLoadPersonByIdArgs = {
  id: Scalars['String']['input'];
};

export type QueryLoadPostByFilterArgs = {
  filter: PostFilterInput;
};

export type QueryLoadPostByIdArgs = {
  postId: Scalars['String']['input'];
};

export type QueryLoadPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryLoadPostsByUserIdArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryLoadUserByIdArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type ReadStatus = {
  __typename?: 'ReadStatus';
  read_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
};

export type Requirement = {
  __typename?: 'Requirement';
  desired_roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  desired_skills?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type RequirementInput = {
  desired_roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  desired_skills?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  preferred_experience?: InputMaybe<Scalars['String']['input']>;
};

export type SavedPost = {
  __typename?: 'SavedPost';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  post_id: Scalars['String']['output'];
  user_id: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
};

export type UnreadChatCount = {
  __typename?: 'UnreadChatCount';
  chat_id: Scalars['String']['output'];
  unread_count: Scalars['Int']['output'];
};

export type UpdateAchievementInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEducationInput = {
  degree?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  field_of_study?: InputMaybe<Scalars['String']['input']>;
  grade?: InputMaybe<Scalars['String']['input']>;
  institution_name?: InputMaybe<Scalars['String']['input']>;
  is_current?: InputMaybe<Scalars['Boolean']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
};

export type UpdateExperienceInput = {
  company_name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  employment_type?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  is_current?: InputMaybe<Scalars['Boolean']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
};

export type UpdatePostInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  experience_level?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  project_phase?: InputMaybe<Scalars['String']['input']>;
  project_type?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<RequirementInput>;
  status?: InputMaybe<Scalars['String']['input']>;
  tech_stack?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
  work_mode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  github_url?: InputMaybe<Scalars['String']['input']>;
  is_current?: InputMaybe<Scalars['Boolean']['input']>;
  project_url?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
  technologies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Array<InputMaybe<LinkInput>>>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserSkillInput = {
  proficiency_level?: InputMaybe<Scalars['String']['input']>;
  skill_name?: InputMaybe<Scalars['String']['input']>;
  years_experience?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  connections_count?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['Date']['output'];
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  is_connection?: Maybe<Scalars['String']['output']>;
  is_online?: Maybe<Scalars['Boolean']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  last_seen?: Maybe<Scalars['Date']['output']>;
  links?: Maybe<Array<Maybe<Link>>>;
  location_id?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Date']['output'];
};

export type UserSkill = {
  __typename?: 'UserSkill';
  _id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  proficiency_level: Scalars['String']['output'];
  skill_name: Scalars['String']['output'];
  updated_at: Scalars['Date']['output'];
  user_id: Scalars['String']['output'];
  years_experience?: Maybe<Scalars['Int']['output']>;
};
