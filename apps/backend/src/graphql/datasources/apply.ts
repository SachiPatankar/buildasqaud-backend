import { IApplicationDataSource } from './types';
import {
  ApplicationModel,
  UserModel,
  UserSkillModel,
  PostModel,
  SavedPostModel,
  ConnectionModel,
} from '@db';
import {
  Application,
  ApplicationsByPostIdResponse,
} from '../../types/generated';

// Helper to build PostSummary from post doc, user, savedPosts, appliedPosts
function buildPostSummary(post, user, appliedPostStatusMap) {
  return {
    _id: post._id,
    title: post.title,
    description: post.description,
    posted_by: post.posted_by,
    first_name: user.first_name,
    last_name: user.last_name,
    photo: user.photo,
    tech_stack: post.tech_stack,
    work_mode: post.work_mode,
    experience_level: post.experience_level,
    location_id: post.location_id,
    status: post.status,
    views_count: post.views_count,
    applications_count: post.applications_count,
    is_saved: false,
    is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

export default class ApplicationDataSource implements IApplicationDataSource {
  loadApplicationsByPostId = async (
    postId: string,
    current_user_id?: string
  ): Promise<ApplicationsByPostIdResponse[]> => {
    try {
      // Use aggregation pipeline for better performance
      const applications = await ApplicationModel.aggregate([
        // Stage 1: Match applications for the post
        {
          $match: { post_id: postId }
        },
        // Stage 2: Sort by created_at
        {
          $sort: { created_at: -1 }
        },
        // Stage 3: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'applicant_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1,
                  location_id: 1,
                  title: 1,
                  bio: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        // Stage 4: Lookup top skills
        {
          $lookup: {
            from: 'userskillmodels',
            let: { applicantId: '$applicant_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user_id', '$$applicantId'] },
                      { $eq: ['$is_top', true] }
                    ]
                  }
                }
              },
              {
                $limit: 4
              },
              {
                $project: {
                  _id: 1,
                  skill_name: 1,
                  proficiency_level: 1,
                  years_of_experience: 1,
                  is_top: 1
                }
              }
            ],
            as: 'top_skills'
          }
        },
        // Stage 5: Check connection status if current_user_id provided
        ...(current_user_id ? [{
          $lookup: {
            from: 'connectionmodels',
            let: { 
              applicantId: '$applicant_id', 
              currentUserId: { $literal: current_user_id } 
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$requester_user_id', '$$currentUserId'] },
                          { $eq: ['$addressee_user_id', '$$applicantId'] }
                        ]
                      },
                      {
                        $and: [
                          { $eq: ['$requester_user_id', '$$applicantId'] },
                          { $eq: ['$addressee_user_id', '$$currentUserId'] }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                $project: { status: 1 }
              }
            ],
            as: 'connection'
          }
        }] : []),
        // Stage 6: Project final format
        {
          $project: {
            _id: 1,
            post_id: 1,
            applicant_id: 1,
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            photo: '$user.photo',
            location_id: '$user.location_id',
            title: '$user.title',
            bio: '$user.bio',
            top_skills: {
              $map: {
                input: '$top_skills',
                as: 'skill',
                in: {
                  _id: '$$skill._id',
                  skill_name: '$$skill.skill_name',
                  proficiency_level: '$$skill.proficiency_level',
                  years_of_experience: '$$skill.years_of_experience',
                  is_top: '$$skill.is_top'
                }
              }
            },
            is_connection: current_user_id ? {
              $cond: {
                if: { $gt: [{ $size: '$connection' }, 0] },
                then: { $arrayElemAt: ['$connection.status', 0] },
                else: null
              }
            } : null,
            message: 1,
            status: 1,
            created_at: 1,
            updated_at: 1
          }
        }
      ]);

      return applications;
    } catch (error) {
      console.error('Error in loadApplicationsByPostId:', error);
      // Fallback to original implementation
      const applications = await ApplicationModel.find({ post_id: postId })
        .sort({ created_at: -1 })
        .lean();
      if (applications.length === 0) return [];

      const applicantIds = applications.map((app) => app.applicant_id);
      const users = await UserModel.find({ _id: { $in: applicantIds } })
        .select('first_name last_name photo location_id title bio')
        .lean();
      const userMap = users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {} as Record<string, any>);

      const skills = await UserSkillModel.find({
        user_id: { $in: applicantIds },
        is_top: true,
      })
        .limit(4 * applicantIds.length)
        .lean();
      const skillsMap: Record<string, any[]> = {};
      skills.forEach((skill) => {
        if (!skillsMap[skill.user_id]) skillsMap[skill.user_id] = [];
        if (skillsMap[skill.user_id].length < 4)
          skillsMap[skill.user_id].push(skill);
      });

      const connectionsMap: Record<string, string | null> = {};
      if (current_user_id) {
        const connections = await ConnectionModel.find({
          $or: applicantIds.map((applicantId) => ({
            $or: [
              {
                requester_user_id: current_user_id,
                addressee_user_id: applicantId,
              },
              {
                requester_user_id: applicantId,
                addressee_user_id: current_user_id,
              },
            ],
          })),
        }).lean();
        connections.forEach((conn) => {
          const otherId =
            conn.requester_user_id === current_user_id
              ? conn.addressee_user_id
              : conn.requester_user_id;
          connectionsMap[otherId] = conn.status;
        });
      }

      return applications.map((app) => {
        const user = userMap[app.applicant_id] || {};
        let is_connection = null;
        if (current_user_id && app.applicant_id !== current_user_id) {
          is_connection = connectionsMap[app.applicant_id] || null;
        }
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
          is_connection,
          message: app.message,
          status: app.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
        };
      });
    }
  };

  getApplicationsByUser = async (userId: string): Promise<any[]> => {
    const applications = await ApplicationModel.find({ applicant_id: userId })
      .sort({
        created_at: -1,
      })
      .lean();
    if (applications.length === 0) return [];

    // Fetch all post IDs
    const postIds = applications.map((app) => app.post_id);
    const posts = await PostModel.find({ _id: { $in: postIds } }).lean();
    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // Get the list of saved posts and applications for the current user
    const savedPosts = await SavedPostModel.find({ user_id: userId }).lean();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: userId,
    }).lean();
    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });
    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id.toString()));

    // Build PostSummary for each post
    const postMap = posts.reduce((acc, post) => {
      const user = userMap[post.posted_by.toString()];
      acc[post._id.toString()] = buildPostSummary(
        post,
        user,
        appliedPostStatusMap
      );
      return acc;
    }, {});

    return applications.map((app) => ({
      post: postMap[app.post_id],
      application: app,
    }));
  };

  applyToPost = async (
    postId: string,
    applicantId: string,
    message: string
  ): Promise<Application> => {
    // Always create a new application
    const newApplication = new ApplicationModel({
      post_id: postId,
      applicant_id: applicantId,
      message,
      status: 'pending',
    });
    return newApplication.save();
  };

  cancelApplyToPost = async (applicationId: string): Promise<boolean> => {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return false;
    }

    // If the application exists, delete it
    await ApplicationModel.findByIdAndDelete(applicationId);
    return true;
  };

  updateApplicationStatus = async (
    applicationId: string,
    status: string
  ): Promise<Application> => {
    const application = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );
    if (!application) {
      throw new Error('Application not found');
    }
    return application;
  };

  searchMyApplications = async (userId, search) => {
    // Find applications for the user
    const applications = await ApplicationModel.find({
      applicant_id: userId,
    }).lean();
    if (applications.length === 0) return [];
    // Fetch all post IDs
    const postIds = applications.map((app) => app.post_id);
    let posts = [];
    if (search.length < 3) {
      // Use regex for prefix match on title
      posts = await PostModel.find({
        _id: { $in: postIds },
        title: { $regex: `^${search}`, $options: 'i' },
      }).lean();
    } else {
      // Full-text search posts by title/description
      posts = await PostModel.aggregate([
        { $match: { _id: { $in: postIds }, $text: { $search: search } } },
        { $addFields: { score: { $meta: 'textScore' } } },
        { $sort: { score: -1 } },
      ]);
    }
    const filteredPostIds = new Set(posts.map((post) => post._id.toString()));
    const filteredApplications = applications.filter((app) =>
      filteredPostIds.has(app.post_id.toString())
    );
    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});
    const appliedPosts = await ApplicationModel.find({
      applicant_id: userId,
    }).lean();
    const appliedPostStatusMap = new Map();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });
    const postMap = posts.reduce((acc, post) => {
      const user = userMap[post.posted_by.toString()];
      acc[post._id.toString()] = buildPostSummary(
        post,
        user,
        appliedPostStatusMap
      );
      return acc;
    }, {});
    return filteredApplications.map((app) => ({
      post: postMap[app.post_id],
      application: app,
    }));
  };
}
