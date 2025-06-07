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
};

export type Chat = {
  __typename?: 'Chat';
  _id: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  is_group: Scalars['Boolean']['output'];
  participant_ids?: Maybe<Array<Scalars['String']['output']>>;
  updated_at: Scalars['String']['output'];
};

export type CreateExperienceInput = {
  company: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
};

export type CreateHackathonInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateHackathonWinInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  rank?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type Experience = {
  __typename?: 'Experience';
  _id: Scalars['String']['output'];
  company: Scalars['String']['output'];
  created_at?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  location_id?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
  profile_id: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
};

export type Friend = {
  __typename?: 'Friend';
  _id: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  friend_id: Scalars['String']['output'];
  friendship_type: FriendshipType;
  status: FriendStatus;
  updated_at: Scalars['String']['output'];
  user_id: Scalars['String']['output'];
};

export enum FriendStatus {
  Friend = 'FRIEND',
  Incoming = 'INCOMING',
  Requested = 'REQUESTED',
}

export enum FriendshipType {
  Accepted = 'ACCEPTED',
  Blocked = 'BLOCKED',
  Pending = 'PENDING',
}

export type GroupChat = {
  __typename?: 'GroupChat';
  _id: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  is_group: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type Hackathon = {
  __typename?: 'Hackathon';
  created_at?: Maybe<Scalars['String']['output']>;
  creator_id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  interestedCount: Scalars['Int']['output'];
  location_id?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum HackathonState {
  Live = 'LIVE',
  Past = 'PAST',
  Upcoming = 'UPCOMING',
}

export type HackathonWin = {
  __typename?: 'HackathonWin';
  _id: Scalars['String']['output'];
  created_at?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  profile_id: Scalars['String']['output'];
  rank?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
};

export type Link = {
  __typename?: 'Link';
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type LinkInput = {
  link: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  _id: Scalars['String']['output'];
  chat_id: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  message: Scalars['String']['output'];
  read_status: Scalars['Boolean']['output'];
  sender_id: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addToChat: Chat;
  cancelFriendRequest: Scalars['Boolean']['output'];
  changePassword: Scalars['Boolean']['output'];
  createChat: Chat;
  createExperience: Experience;
  createGroup: Chat;
  createHackathon: Hackathon;
  createHackathonWin: HackathonWin;
  createProject: Project;
  deleteExperienceByID: Scalars['Boolean']['output'];
  deleteHackathonWinByID: Scalars['Boolean']['output'];
  deleteMessageForEveryone: Scalars['Boolean']['output'];
  deleteMessageForMe: Scalars['Boolean']['output'];
  deletePhoto: User;
  deleteProfilePhoto: Scalars['Boolean']['output'];
  deleteProjectByID: Scalars['Boolean']['output'];
  interested: Hackathon;
  removeFriend: Scalars['Boolean']['output'];
  removeFromChat: Chat;
  respondToRequest: Friend;
  sendFriendRequest: Friend;
  sendMessage: Message;
  uninterested: Hackathon;
  updateCurrentUserProfile: Profile;
  updateExperienceByID: Experience;
  updateHackathon: Hackathon;
  updateHackathonWinByID: HackathonWin;
  updateProjectByID: Project;
  updateUser: User;
  updateUserPhoto: User;
};

export type MutationAddToChatArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type MutationCancelFriendRequestArgs = {
  requestId: Scalars['String']['input'];
};

export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationCreateChatArgs = {
  participantIds: Array<Scalars['String']['input']>;
};

export type MutationCreateExperienceArgs = {
  input: CreateExperienceInput;
};

export type MutationCreateGroupArgs = {
  name: Scalars['String']['input'];
  participantIds: Array<Scalars['String']['input']>;
};

export type MutationCreateHackathonArgs = {
  input: CreateHackathonInput;
};

export type MutationCreateHackathonWinArgs = {
  input: CreateHackathonWinInput;
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};

export type MutationDeleteExperienceByIdArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteHackathonWinByIdArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteMessageForEveryoneArgs = {
  messageId: Scalars['String']['input'];
};

export type MutationDeleteMessageForMeArgs = {
  messageId: Scalars['String']['input'];
};

export type MutationDeleteProfilePhotoArgs = {
  photoUrl: Scalars['String']['input'];
};

export type MutationDeleteProjectByIdArgs = {
  id: Scalars['String']['input'];
};

export type MutationInterestedArgs = {
  hackathonId: Scalars['String']['input'];
};

export type MutationRemoveFriendArgs = {
  friendshipId: Scalars['String']['input'];
};

export type MutationRemoveFromChatArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type MutationRespondToRequestArgs = {
  accept: Scalars['Boolean']['input'];
  requestId: Scalars['String']['input'];
};

export type MutationSendFriendRequestArgs = {
  toUserId: Scalars['String']['input'];
};

export type MutationSendMessageArgs = {
  chatId: Scalars['String']['input'];
  content: Scalars['String']['input'];
};

export type MutationUninterestedArgs = {
  hackathonId: Scalars['String']['input'];
};

export type MutationUpdateCurrentUserProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateExperienceByIdArgs = {
  input: UpdateExperienceInput;
};

export type MutationUpdateHackathonArgs = {
  input: UpdateHackathonInput;
};

export type MutationUpdateHackathonWinByIdArgs = {
  input: UpdateHackathonWinInput;
};

export type MutationUpdateProjectByIdArgs = {
  input: UpdateProjectInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserPhotoArgs = {
  photoUrl: Scalars['String']['input'];
};

export type Person = {
  __typename?: 'Person';
  _id: Scalars['String']['output'];
  created_at?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<PersonProfile>;
};

export type PersonProfile = {
  __typename?: 'PersonProfile';
  bio?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type PresignedUrlResult = {
  __typename?: 'PresignedUrlResult';
  file_url: Scalars['String']['output'];
  upload_url: Scalars['String']['output'];
};

export type Profile = {
  __typename?: 'Profile';
  _id: Scalars['String']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<Scalars['String']['output']>;
  college?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['String']['output']>;
  links: Array<Link>;
  location_id?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['String']['output'];
  year?: Maybe<Scalars['String']['output']>;
};

export type Project = {
  __typename?: 'Project';
  _id: Scalars['String']['output'];
  created_at?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  profile_id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  getAllChatsForUser: Array<Chat>;
  getAllExperiencesByProfileId: Array<Experience>;
  getAllGroupsForUser: Array<GroupChat>;
  getAllHackathonWinsByProfileId: Array<HackathonWin>;
  getAllHackathons: Array<Hackathon>;
  getAllProjectsByProfileId: Array<Project>;
  getCurrentUserExperiences: Array<Experience>;
  getCurrentUserHackathonWins: Array<HackathonWin>;
  getCurrentUserProfile?: Maybe<Profile>;
  getCurrentUserProjects: Array<Project>;
  getHackathonById?: Maybe<Hackathon>;
  getPeople: Array<Person>;
  getPresignedUrl: PresignedUrlResult;
  getProfileById?: Maybe<Profile>;
  loadPreviousMessages: Array<Message>;
  oneToOneChat: Chat;
};

export type QueryGetAllExperiencesByProfileIdArgs = {
  profileId: Scalars['String']['input'];
};

export type QueryGetAllHackathonWinsByProfileIdArgs = {
  profileId: Scalars['String']['input'];
};

export type QueryGetAllHackathonsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGetAllProjectsByProfileIdArgs = {
  profileId: Scalars['String']['input'];
};

export type QueryGetHackathonByIdArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGetPresignedUrlArgs = {
  fileType: Scalars['String']['input'];
  folder?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetProfileByIdArgs = {
  id: Scalars['String']['input'];
};

export type QueryLoadPreviousMessagesArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  chatId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryOneToOneChatArgs = {
  otherUserId: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
};

export type UpdateExperienceInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  location_id?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHackathonInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  location_id?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHackathonWinInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  rank?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  branch?: InputMaybe<Scalars['String']['input']>;
  college?: InputMaybe<Scalars['String']['input']>;
  links?: InputMaybe<Array<LinkInput>>;
  location_id?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  link?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
};
