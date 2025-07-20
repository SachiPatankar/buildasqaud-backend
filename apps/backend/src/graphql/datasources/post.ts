// graphql/datasources/post.ts
import { IPostDataSource } from './types';
import {
  PostModel,
  UserModel,
  SavedPostModel,
  ApplicationModel,
  UserSkillModel,
  ExperienceModel,
  ProjectModel,
  ConnectionModel,
  ChatModel,
} from '@db';
import { Post, CreatePostInput, UpdatePostInput, PostFilterInput, PostSummary, PostDetails } from '../../types/generated';
import { RecommendationEngine } from '../../lib/recommendation-engine';
import { AdvancedSearch } from '../../lib/advanced-search';

export default class PostDataSource implements IPostDataSource {
  loadPosts = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    try {
      // Use aggregation pipeline for better performance
      const posts = await PostModel.aggregate([
        // Stage 1: Sort and paginate posts
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        // Stage 2: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'posted_by',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        // Stage 3: Add saved and applied status
        {
          $lookup: {
            from: 'savedpostmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$user_id', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'saved'
          }
        },
        {
          $lookup: {
            from: 'applicationmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$applicant_id', '$$userId'] }
                    ]
                  }
                }
              },
              {
                $project: { status: 1 }
              }
            ],
            as: 'applied'
          }
        },
        // Stage 4: Project final format
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            posted_by: 1,
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            photo: '$user.photo',
            tech_stack: 1,
            work_mode: 1,
            experience_level: 1,
            location_id: 1,
            status: 1,
            views_count: 1,
            applications_count: 1,
            is_saved: { $gt: [{ $size: '$saved' }, 0] },
            is_applied: {
              $cond: {
                if: { $gt: [{ $size: '$applied' }, 0] },
                then: { $arrayElemAt: ['$applied.status', 0] },
                else: null
              }
            },
            created_at: 1,
            updated_at: 1,
            requirements: 1
          }
        }
      ]);

      return posts;
    } catch (error) {
      console.error('Error in loadPosts:', error);
      // Fallback to original implementation
    const posts = await PostModel.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 })
        .lean()
      .exec();

    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .lean()
      .exec();
    const userMap = users.reduce((acc, user) => {
        acc[user._id] = user;
      return acc;
    }, {});

    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));

      return posts.map((post) => {
        const user = userMap[post.posted_by];
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
          first_name: user?.first_name,
          last_name: user?.last_name,
          photo: user?.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: savedPostIds.has(post._id.toString()),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });
    }
  };

  loadPostById = async (
    postId: string,
    current_user_id: string
  ): Promise<PostDetails | null> => {
    try {
      // Use aggregation pipeline for better performance
      const results = await PostModel.aggregate([
        // Stage 1: Match the specific post
        {
          $match: { _id: postId }
        },
        // Stage 2: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'posted_by',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        // Stage 3: Check saved status
        {
          $lookup: {
            from: 'savedpostmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$user_id', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'saved'
          }
        },
        // Stage 4: Check applied status
        {
          $lookup: {
            from: 'applicationmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$applicant_id', '$$userId'] }
                    ]
                  }
                }
              },
              {
                $project: { status: 1 }
              }
            ],
            as: 'applied'
          }
        },
        // Stage 5: Check connection status
        {
          $lookup: {
            from: 'connectionmodels',
            let: { 
              postUserId: '$posted_by', 
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
                          { $eq: ['$addressee_user_id', '$$postUserId'] }
                        ]
                      },
                      {
                        $and: [
                          { $eq: ['$requester_user_id', '$$postUserId'] },
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
        },
        // Stage 6: Check chat if connection is accepted
        {
          $lookup: {
            from: 'chatmodels',
            let: { 
              postUserId: '$posted_by', 
              currentUserId: { $literal: current_user_id },
              connectionStatus: { $arrayElemAt: ['$connection.status', 0] }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$connectionStatus', 'accepted'] },
                      { $all: ['$participant_ids', ['$$currentUserId', { $toString: '$$postUserId' }]] }
                    ]
                  }
                }
              },
              {
                $project: { _id: 1 }
              }
            ],
            as: 'chat'
          }
        },
        // Stage 7: Project final format
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            posted_by: 1,
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            photo: '$user.photo',
            tech_stack: 1,
            work_mode: 1,
            experience_level: 1,
            location_id: 1,
            status: 1,
            views_count: 1,
            applications_count: 1,
            requirements: 1,
            project_phase: 1,
            project_type: 1,
            is_saved: { $gt: [{ $size: '$saved' }, 0] },
            is_applied: {
              $cond: {
                if: { $gt: [{ $size: '$applied' }, 0] },
                then: { $arrayElemAt: ['$applied.status', 0] },
                else: null
              }
            },
            created_at: 1,
            updated_at: 1,
            is_connection: {
              $cond: {
                if: { $gt: [{ $size: '$connection' }, 0] },
                then: { $arrayElemAt: ['$connection.status', 0] },
                else: null
              }
            },
            chat_id: {
              $cond: {
                if: { $gt: [{ $size: '$chat' }, 0] },
                then: { $arrayElemAt: ['$chat._id', 0] },
                else: null
              }
            }
          }
        }
      ]);

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error in loadPostById:', error);
      // Fallback to original implementation
    const post = await PostModel.findById(postId).lean().exec();
    if (!post) {
      return null;
    }

    const user = await UserModel.findById(post.posted_by).lean().exec();
    if (!user) {
      return null;
    }

    const savedPost = await SavedPostModel.findOne({
      post_id: postId,
      user_id: current_user_id,
    })
      .lean()
      .exec();
    const appliedPost = await ApplicationModel.findOne({
      post_id: postId,
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    const isSaved = savedPost !== null;
    const isApplied = appliedPost?.status;

    let is_connection = null;
    let chat_id = null;
    if (current_user_id && user._id.toString() !== current_user_id) {
      const connection = await ConnectionModel.findOne({
        $or: [
          { requester_user_id: current_user_id, addressee_user_id: user._id },
          { requester_user_id: user._id, addressee_user_id: current_user_id },
        ],
      });
      is_connection = connection ? connection.status : null;
      if (is_connection === 'accepted') {
        const chat = await ChatModel.findOne({
          participant_ids: { $all: [current_user_id, user._id.toString()] },
        });
        chat_id = chat ? chat._id : null;
      }
    }

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
      requirements: post.requirements,
      project_phase: post.project_phase,
      project_type: post.project_type,
      is_saved: isSaved,
      is_applied: isApplied,
      created_at: post.created_at,
      updated_at: post.updated_at,
      is_connection,
      chat_id,
    };
    }
  };

  loadPostByFilter = async (
    filter: PostFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    try {
    // Build MongoDB query from PostFilterInput
      const matchQuery: any = {};
      if (filter.status) {
        matchQuery.status = filter.status;
      }
      // Relaxed matching for project_type
      if (filter.project_type && filter.project_type.length > 0) {
        matchQuery.project_type = {
          $elemMatch: {
            $regex: filter.project_type.join('|'),
            $options: 'i',
          },
        };
      }
      // Strict matching for work_mode (enum)
      if (filter.work_mode && filter.work_mode.length > 0) {
        matchQuery.work_mode = { $in: filter.work_mode };
      }
      // Relaxed matching for tech_stack
      if (filter.tech_stack && filter.tech_stack.length > 0) {
        matchQuery.tech_stack = {
          $elemMatch: {
            $regex: filter.tech_stack.join('|'),
            $options: 'i',
          },
        };
      }
      // Strict matching for experience_level (enum)
      if (filter.experience_level && filter.experience_level.length > 0) {
        matchQuery.experience_level = { $in: filter.experience_level };
      }
      // Relaxed matching for desired_roles
      if (filter.desired_roles && filter.desired_roles.length > 0) {
        matchQuery['requirements.desired_roles'] = {
          $elemMatch: {
            $regex: filter.desired_roles.join('|'),
            $options: 'i',
          },
        };
      }

      // Use aggregation pipeline for better performance
      const posts = await PostModel.aggregate([
        // Stage 1: Match posts based on filter
        {
          $match: matchQuery
        },
        // Stage 2: Sort by created_at
        {
          $sort: { created_at: -1 }
        },
        // Stage 3: Pagination
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        // Stage 4: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'posted_by',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        // Stage 5: Add saved and applied status
        {
          $lookup: {
            from: 'savedpostmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$user_id', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'saved'
          }
        },
        {
          $lookup: {
            from: 'applicationmodels',
            let: { postId: '$_id', userId: { $literal: current_user_id } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$applicant_id', '$$userId'] }
                    ]
                  }
                }
              },
              {
                $project: { status: 1 }
              }
            ],
            as: 'applied'
          }
        },
        // Stage 6: Project final format
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            posted_by: 1,
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            photo: '$user.photo',
            tech_stack: 1,
            work_mode: 1,
            experience_level: 1,
            location_id: 1,
            status: 1,
            views_count: 1,
            applications_count: 1,
            is_saved: { $gt: [{ $size: '$saved' }, 0] },
            is_applied: {
              $cond: {
                if: { $gt: [{ $size: '$applied' }, 0] },
                then: { $arrayElemAt: ['$applied.status', 0] },
                else: null
              }
            },
            created_at: 1,
            updated_at: 1,
            requirements: 1
          }
        }
      ]);

      return posts;
    } catch (error) {
      console.error('Error in loadPostByFilter:', error);
      // Fallback to original implementation
    const query: any = {};
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.project_type && filter.project_type.length > 0) {
      query.project_type = {
        $elemMatch: {
          $regex: filter.project_type.join('|'),
          $options: 'i',
        },
      };
    }
    if (filter.work_mode && filter.work_mode.length > 0) {
      query.work_mode = { $in: filter.work_mode };
    }
    if (filter.tech_stack && filter.tech_stack.length > 0) {
      query.tech_stack = {
        $elemMatch: {
          $regex: filter.tech_stack.join('|'),
          $options: 'i',
        },
      };
    }
    if (filter.experience_level && filter.experience_level.length > 0) {
      query.experience_level = { $in: filter.experience_level };
    }
    if (filter.desired_roles && filter.desired_roles.length > 0) {
      query['requirements.desired_roles'] = {
        $elemMatch: {
          $regex: filter.desired_roles.join('|'),
          $options: 'i',
        },
      };
    }

    const posts = await PostModel.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .lean()
      .exec();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    })
      .lean()
      .exec();

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));
    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

      return posts.map((post) => {
      const user = userMap[post.posted_by];
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
          first_name: user?.first_name,
          last_name: user?.last_name,
          photo: user?.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: savedPostIds.has(post._id.toString()),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });
    }
  };

  createPost = async (
    input: CreatePostInput,
    postedBy: string
  ): Promise<Post> => {
    const cleanedInput = { ...input };

    if (cleanedInput.work_mode === '') {
      cleanedInput.work_mode = undefined;
    }
    if (cleanedInput.experience_level === '') {
      cleanedInput.experience_level = undefined;
    }

    const newPost = new PostModel({ ...cleanedInput, posted_by: postedBy });
    return newPost.save();
  };
  updatePost = async (
    postId: string,
    input: UpdatePostInput
  ): Promise<Post | null> => {
    return PostModel.findByIdAndUpdate(postId, input, { new: true });
  };

  deletePost = async (postId: string): Promise<boolean> => {
    await PostModel.findByIdAndDelete(postId);
    return true;
  };

  incrementPostView = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { $inc: { views_count: 1 } },
      { new: true }
    );
  };

  closePost = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'closed' },
      { new: true }
    );
  };

  openPost = async (postId: string): Promise<Post> => {
    return PostModel.findByIdAndUpdate(
      postId,
      { status: 'open' },
      { new: true }
    );
  };

  loadPostsByUserId = async (userId: string): Promise<PostSummary[]> => {
    try {
      // Use aggregation pipeline for better performance
      const posts = await PostModel.aggregate([
        // Stage 1: Match posts by user ID
        {
          $match: { posted_by: userId }
        },
        // Stage 2: Sort by created_at
        {
          $sort: { created_at: -1 }
        },
        // Stage 3: Lookup user data
        {
          $lookup: {
            from: 'usermodels',
            localField: 'posted_by',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  photo: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        // Stage 4: Check applied status (user can't save their own posts)
        {
          $lookup: {
            from: 'applicationmodels',
            let: { postId: '$_id', userId: { $literal: userId } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$post_id', '$$postId'] },
                      { $eq: ['$applicant_id', '$$userId'] }
                    ]
                  }
                }
              },
              {
                $project: { status: 1 }
              }
            ],
            as: 'applied'
          }
        },
        // Stage 5: Project final format
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            posted_by: 1,
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            photo: '$user.photo',
            tech_stack: 1,
            work_mode: 1,
            experience_level: 1,
            location_id: 1,
            status: 1,
            views_count: 1,
            applications_count: 1,
            is_saved: false, // User can't save their own posts
            is_applied: {
              $cond: {
                if: { $gt: [{ $size: '$applied' }, 0] },
                then: { $arrayElemAt: ['$applied.status', 0] },
                else: null
              }
            },
            created_at: 1,
            updated_at: 1,
            requirements: 1
          }
        }
      ]);

      return posts;
    } catch (error) {
      console.error('Error in loadPostsByUserId:', error);
      // Fallback to original implementation
    const posts = await PostModel.find({ posted_by: userId })
      .sort({ created_at: -1 })
      .lean()
      .exec();

    const user = await UserModel.findById(userId).lean().exec();
    if (!user) return [];

    const savedPosts = await SavedPostModel.find({ user_id: userId })
      .lean()
      .exec();
    const appliedPosts = await ApplicationModel.find({
      applicant_id: userId,
    })
      .lean()
      .exec();

    const appliedPostStatusMap = new Map<string, string>();
    appliedPosts.forEach((ap) => {
      appliedPostStatusMap.set(ap.post_id.toString(), ap.status);
    });

    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));

      return posts.map((post) => {
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
        requirements: post.requirements,
      };
    });
    }
  };

  loadByRecommendation = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<PostSummary[]> => {
    try {
      // Use the enhanced recommendation engine
      const recommendations = await RecommendationEngine.getPostRecommendations(
        current_user_id,
        {
          limit,
          page: page - 1, // Convert to 0-based indexing
        }
      );

      // Convert recommendations to PostSummary format
      const postSummaries: PostSummary[] = [];

      for (const recommendation of recommendations) {
        const post = recommendation.post;
        
        // Get user details
        const user = await UserModel.findById(post.posted_by).lean();
        
        // Get saved and applied status
        const [savedPost, appliedPost] = await Promise.all([
          SavedPostModel.findOne({ 
            user_id: current_user_id, 
            post_id: post._id 
          }).lean(),
          ApplicationModel.findOne({ 
            applicant_id: current_user_id, 
            post_id: post._id 
          }).lean(),
        ]);

        // Get connection and chat info
        let is_connection = null;
        let chat_id = null;
        if (user && user._id.toString() !== current_user_id) {
          const connection = await ConnectionModel.findOne({
            $or: [
              {
                requester_user_id: current_user_id,
                addressee_user_id: user._id,
              },
              {
                requester_user_id: user._id,
                addressee_user_id: current_user_id,
              },
            ],
          });
          is_connection = connection ? connection.status : null;
          if (is_connection === 'accepted') {
            const chat = await ChatModel.findOne({
              participant_ids: { $all: [current_user_id, user._id.toString()] },
            });
            chat_id = chat ? chat._id : null;
          }
        }

        postSummaries.push({
          _id: post._id,
          title: post.title,
          description: post.description,
          posted_by: post.posted_by,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          photo: user?.photo || '',
          tech_stack: post.tech_stack || [],
          work_mode: post.work_mode || '',
          experience_level: post.experience_level || '',
          location_id: post.location_id || '',
          status: post.status,
          views_count: post.views_count || 0,
          applications_count: post.applications_count || 0,
          is_saved: !!savedPost,
          is_applied: appliedPost?.status || null,
          created_at: post.created_at,
          updated_at: post.updated_at,
          requirements: post.requirements,
        });
      }

      return postSummaries;
    } catch (error) {
      console.error('Error in loadByRecommendation:', error);
      // Fallback to original implementation
      return this.loadPosts(page, limit, current_user_id);
    }
  };

  searchProjects = async (search, current_user_id) => {
    try {
      // Use the enhanced search engine
      const searchResults = await AdvancedSearch.searchPosts({
        query: search,
        limit: 20,
        page: 0,
        status: 'open',
      });

      // Convert search results to PostSummary format
      const postSummaries: PostSummary[] = [];

      for (const post of searchResults.data) {
        // Get user details
        const user = await UserModel.findById(post.posted_by).lean();
        
        // Get saved and applied status
        const [savedPost, appliedPost] = await Promise.all([
          SavedPostModel.findOne({ 
            user_id: current_user_id, 
            post_id: post._id 
          }).lean(),
          ApplicationModel.findOne({ 
      applicant_id: current_user_id,
            post_id: post._id 
          }).lean(),
        ]);

        // Get connection and chat info
        let is_connection = null;
        let chat_id = null;
        if (user && user._id.toString() !== current_user_id) {
          const connection = await ConnectionModel.findOne({
            $or: [
              {
                requester_user_id: current_user_id,
                addressee_user_id: user._id,
              },
              {
                requester_user_id: user._id,
                addressee_user_id: current_user_id,
              },
            ],
          });
          is_connection = connection ? connection.status : null;
          if (is_connection === 'accepted') {
            const chat = await ChatModel.findOne({
              participant_ids: { $all: [current_user_id, user._id.toString()] },
            });
            chat_id = chat ? chat._id : null;
          }
        }

        postSummaries.push({
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          photo: user?.photo || '',
          tech_stack: post.tech_stack || [],
          work_mode: post.work_mode || '',
          experience_level: post.experience_level || '',
          location_id: post.location_id || '',
        status: post.status,
          views_count: post.views_count || 0,
          applications_count: post.applications_count || 0,
          is_saved: !!savedPost,
          is_applied: appliedPost?.status || null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
    });
      }

      return postSummaries;
    } catch (error) {
      console.error('Error in searchProjects:', error);
      // Fallback to original implementation
    let posts = [];
    if (search.length < 3) {
      // Use regex for prefix match
      posts = await PostModel.find({
        $or: [
          { title: { $regex: `^${search}`, $options: 'i' } },
          {
            tech_stack: { $elemMatch: { $regex: `^${search}`, $options: 'i' } },
          },
          {
            project_type: {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
          {
            'requirements.desired_skills': {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
          {
            'requirements.desired_roles': {
              $elemMatch: { $regex: `^${search}`, $options: 'i' },
            },
          },
        ],
      }).lean();
    } else {
      // Use $text for full-text search
      posts = await PostModel.aggregate([
        { $match: { $text: { $search: search } } },
        { $addFields: { score: { $meta: 'textScore' } } },
        { $sort: { score: -1 } },
      ]);
    }
    const userIds = posts.map((post) => post.posted_by);
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});
    const savedPosts = await SavedPostModel.find({ user_id: current_user_id })
      .lean()
      .exec();
    const savedPostIds = new Set(savedPosts.map((sp) => sp.post_id));
    const appliedPosts = await ApplicationModel.find({
      applicant_id: current_user_id,
    }).lean();
    const appliedPostStatusMap = new Map(
      appliedPosts.map((ap) => [ap.post_id.toString(), ap.status])
    );
    return posts.map((post) => {
      const user = userMap[post.posted_by];
      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        posted_by: post.posted_by,
        first_name: user?.first_name,
        last_name: user?.last_name,
        photo: user?.photo,
        tech_stack: post.tech_stack,
        work_mode: post.work_mode,
        experience_level: post.experience_level,
        location_id: post.location_id,
        status: post.status,
        views_count: post.views_count,
        applications_count: post.applications_count,
        is_saved: savedPostIds.has(post._id.toString()),
        is_applied: appliedPostStatusMap.get(post._id.toString()) ?? null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        requirements: post.requirements,
      };
    });
    }
  };
}
