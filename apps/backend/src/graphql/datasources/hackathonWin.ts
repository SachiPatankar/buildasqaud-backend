import { HackathonWin, Profile } from '@db';
import { IHackathonWinDataSource } from './types';
import { GraphQLError } from 'graphql';
export default class HackathonWinSource implements IHackathonWinDataSource {
  getAllHackathonWinsByProfileId = async (profileId: string) => {
    return HackathonWin.find({ profile_id: profileId }).sort({
      created_at: -1,
    });
  };

  getCurrentUserHackathonWins = async (userId: string) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    return HackathonWin.find({ profile_id: profile._id }).sort({
      created_at: -1,
    });
  };

  createHackathonWin = async (
    input: { title: string; rank?: string; description?: string },
    userId: string
  ) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    const win = new HackathonWin({ ...input, profile_id: profile._id });
    return win.save();
  };

  updateHackathonWinByID = async (
    id: string,
    input: { title?: string; rank?: string; description?: string },
    userId: string
  ) => {
    const win = await HackathonWin.findById(id);
    if (!win) throw new GraphQLError('HackathonWin not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || win.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    Object.assign(win, input);
    return win.save();
  };

  deleteHackathonWinByID = async (id: string, userId: string) => {
    const win = await HackathonWin.findById(id);
    if (!win) throw new GraphQLError('HackathonWin not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || win.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    await win.deleteOne();
    return true;
  };
}
