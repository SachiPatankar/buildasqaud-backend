import { Experience, Profile } from '@db';
import { IExperienceDataSource } from './types';
import { GraphQLError } from 'graphql';

export default class ExperienceSource implements IExperienceDataSource {
  getAllExperiencesByProfileId = async (profileId: string) => {
    return Experience.find({ profile_id: profileId }).sort({ created_at: -1 });
  };

  getCurrentUserExperiences = async (userId: string) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    return Experience.find({ profile_id: profile._id }).sort({
      created_at: -1,
    });
  };

  createExperience = async (
    input: {
      company: string;
      position?: string;
      duration?: string;
      location_id?: string;
    },
    userId: string
  ) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    const exp = new Experience({ ...input, profile_id: profile._id });
    return exp.save();
  };

  updateExperienceByID = async (
    id: string,
    input: {
      company?: string;
      position?: string;
      duration?: string;
      location_id?: string;
    },
    userId: string
  ) => {
    const exp = await Experience.findById(id);
    if (!exp) throw new GraphQLError('Experience not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || exp.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    Object.assign(exp, input);
    return exp.save();
  };

  deleteExperienceByID = async (id: string, userId: string) => {
    const exp = await Experience.findById(id);
    if (!exp) throw new GraphQLError('Experience not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || exp.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    await exp.deleteOne();
    return true;
  };
}
