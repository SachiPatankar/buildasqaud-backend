import { IApplicationDataSource } from './types';
import { ApplicationModel, UserModel, UserSkillModel } from '@db';
import { Application, ApplicationsByPostIdResponse } from '../../types/generated';

export default class ApplicationDataSource implements IApplicationDataSource {
  async loadApplicationsByPostId(postId: string): Promise<ApplicationsByPostIdResponse[]> {
    // Fetch all applications for the post
    const applications = await ApplicationModel.find({ post_id: postId }).sort({ created_at: -1 }).lean();
    if (applications.length === 0) return [];

    // Batch fetch all users
    const applicantIds = applications.map(app => app.applicant_id);
    const users = await UserModel.find({ _id: { $in: applicantIds } })
      .select('first_name last_name photo location_id title bio')
      .lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {} as Record<string, any>);

    // Batch fetch all top skills for these users
    const skills = await UserSkillModel.find({ user_id: { $in: applicantIds }, is_top: true }).limit(4 * applicantIds.length).lean();
    const skillsMap: Record<string, any[]> = {};
    skills.forEach(skill => {
      if (!skillsMap[skill.user_id]) skillsMap[skill.user_id] = [];
      if (skillsMap[skill.user_id].length < 4) skillsMap[skill.user_id].push(skill);
    });

    // Build the response
    return applications.map(app => {
      const user = userMap[app.applicant_id] || {};
      return {
        _id: app._id,
        post_id: app.post_id,
        applicant_id: app.applicant_id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        photo: user.photo || '',
        location_id: user.location_id || '',
        title: user.title || '',
        bio: user.bio || '',
        top_skills: skillsMap[app.applicant_id] || [],
        message: app.message,
        status: app.status,
        created_at: app.created_at,
        updated_at: app.updated_at,
      };
    });
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return ApplicationModel.find({ applicant_id: userId }).sort({
      created_at: -1,
    });
  }

  async applyToPost(
    postId: string,
    applicantId: string,
    message: string
  ): Promise<Application> {
    const newApplication = new ApplicationModel({
      post_id: postId,
      applicant_id: applicantId,
      message,
      status: 'pending', // New applications start with 'pending' status
    });
    return newApplication.save();
  }

  async cancelApplyToPost(applicationId: string): Promise<boolean> {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return false;
    }

    // If the application exists, withdraw it by setting the status to 'withdrawn'
    application.status = 'withdrawn';
    await application.save();
    return true;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<Application> {
    const application = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );
    if (!application) {
      throw new Error('Application not found');
    }
    return application;
  }
}
