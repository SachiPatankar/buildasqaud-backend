import { Project, Profile } from '@db';
import { IProjectDataSource } from './types';
import { GraphQLError } from 'graphql';

export default class ProjectSource implements IProjectDataSource {
  getAllProjectsByProfileId = async (profileId: string) => {
    return Project.find({ profile_id: profileId }).sort({ created_at: -1 });
  };

  getCurrentUserProjects = async (userId: string) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    return Project.find({ profile_id: profile._id }).sort({ created_at: -1 });
  };

  createProject = async (
    input: { title: string; description?: string; link?: string },
    userId: string
  ) => {
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) throw new GraphQLError('Profile not found');
    const proj = new Project({ ...input, profile_id: profile._id });
    return proj.save();
  };

  updateProjectByID = async (
    id: string,
    input: { title?: string; description?: string; link?: string },
    userId: string
  ) => {
    const proj = await Project.findById(id);
    if (!proj) throw new GraphQLError('Project not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || proj.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    Object.assign(proj, input);
    return proj.save();
  };

  deleteProjectByID = async (id: string, userId: string) => {
    const proj = await Project.findById(id);
    if (!proj) throw new GraphQLError('Project not found');
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile || proj.profile_id !== profile._id)
      throw new GraphQLError('Not authorized');
    await proj.deleteOne();
    return true;
  };
}
