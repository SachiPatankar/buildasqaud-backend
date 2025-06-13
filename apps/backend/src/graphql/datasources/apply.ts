import { IApplicationDataSource } from './types';
import { ApplicationModel } from '@db';
import { Application } from '../../types/generated';

export default class ApplicationDataSource implements IApplicationDataSource {
  async loadApplicationsByPostId(postId: string): Promise<Application[]> {
    return ApplicationModel.find({ post_id: postId }).sort({ created_at: -1 });
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
