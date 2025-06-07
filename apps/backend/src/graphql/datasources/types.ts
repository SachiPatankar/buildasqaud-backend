export interface IDataSource {
  user: IUserDataSource;
  s3: IS3DataSource;
  hackathon: IHackathonDataSource;
  interest: IHackathonInterestDataSource;
  profile: IProfileDataSource;
  people: IPeopleDataSource;
  experience: IExperienceDataSource;
  hackathonWin: IHackathonWinDataSource;
  project: IProjectDataSource;
  friend: IFriendDataSource;
  chat: IChatDataSource;
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

export interface IHackathonDataSource {
  getAllHackathons(page?: number, limit?: number): Promise<any>;
  getHackathonById(hackathonId: string): Promise<any>;
  createHackathon(
    input: {
      title: string;
      description?: string;
      location_id?: string;
      url?: string;
    },
    creatorId: string
  ): Promise<any>;
  updateHackathon(
    hackathonId: string,
    input: {
      title?: string;
      description?: string;
      location_id?: string;
      url?: string;
    },
    creatorId: string
  ): Promise<any>;
}

export interface IHackathonInterestDataSource {
  interested(hackathonId: string, userId: string): Promise<any>;
  uninterested(hackathonId: string, userId: string): Promise<any>;
}

export interface IProfileDataSource {
  getProfileById(profileId: string): Promise<any>;
  getCurrentUserProfile(userId: string): Promise<any>;
  updateCurrentUserProfile(userId: string, data: any): Promise<any>;
}

export interface IPeopleDataSource {
  getPeopleWithProfile(page?: number, limit?: number): Promise<any>;
}

export interface IExperienceDataSource {
  getAllExperiencesByProfileId(profileId: string): Promise<any>;
  getCurrentUserExperiences(userId: string): Promise<any>;
  createExperience(
    input: {
      company: string;
      position?: string;
      duration?: string;
      location_id?: string;
    },
    userId: string
  ): Promise<any>;
  updateExperienceByID(
    id: string,
    input: {
      company?: string;
      position?: string;
      duration?: string;
      location_id?: string;
    },
    userId: string
  ): Promise<any>;
  deleteExperienceByID(id: string, userId: string): Promise<any>;
}

export interface IHackathonWinDataSource {
  getAllHackathonWinsByProfileId(profileId: string): Promise<any>;
  getCurrentUserHackathonWins(userId: string): Promise<any>;
  createHackathonWin(
    input: { title: string; rank?: string; description?: string },
    userId: string
  ): Promise<any>;
  updateHackathonWinByID(
    id: string,
    input: { title?: string; rank?: string; description?: string },
    userId: string
  ): Promise<any>;
  deleteHackathonWinByID(id: string, userId: string): Promise<any>;
}

export interface IProjectDataSource {
  getAllProjectsByProfileId(profileId: string): Promise<any>;
  getCurrentUserProjects(userId: string): Promise<any>;
  createProject(
    input: { title: string; description?: string; link?: string },
    userId: string
  ): Promise<any>;
  updateProjectByID(
    id: string,
    input: { title?: string; description?: string; link?: string },
    userId: string
  ): Promise<any>;
  deleteProjectByID(id: string, userId: string): Promise<any>;
}

export interface IFriendDataSource {
  sendRequest(fromUserId: string, toUserId: string): Promise<any>;
  respondToRequest(
    requestId: string,
    accept: boolean,
    currentUserId: string
  ): Promise<any>;
  cancelRequest(requestId: string, currentUserId: string): Promise<boolean>;
  removeFriend(friendshipId: string, currentUserId: string): Promise<boolean>;
}

export interface IChatDataSource {
  sendMessage(chatId: string, senderId: string, content: string): Promise<any>;
  loadPreviousMessages(
    chatId: string,
    userId: string,
    limit?: number,
    before?: Date
  ): Promise<any[]>;
  deleteMessageForEveryone(messageId: string, userId: string): Promise<boolean>;
  deleteMessageForMe(messageId: string, userId: string): Promise<boolean>;
  createChat(participantIds: string[], creatorId: string): Promise<any>;
  createGroup(
    name: string,
    creatorId: string,
    participantIds: string[]
  ): Promise<any>;
  addToGroup(
    chatId: string,
    userIdToAdd: string,
    actorId: string
  ): Promise<any>;
  removeFromGroup(
    chatId: string,
    userIdToRemove: string,
    actorId: string
  ): Promise<any>;
  getChatByUserIds(userA: string, userB: string): Promise<any>;
  getAllChatsForUser(userId: string): Promise<any[]>;
  getAllGroupsForUser(userId: string): Promise<any[]>;
}
