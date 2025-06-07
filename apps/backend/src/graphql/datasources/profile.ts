import { Profile } from '@db';
import { IProfileDataSource } from './types';

export default class ProfileSource implements IProfileDataSource {
  getProfileById = (profileId: string) => Profile.findById(profileId);

  getCurrentUserProfile = (userId: string) =>
    Profile.findOne({ user_id: userId });

  updateCurrentUserProfile = (userId: string, data: any) =>
    Profile.findOneAndUpdate({ user_id: userId }, data, { new: true });
}
