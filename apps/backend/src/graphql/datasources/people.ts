import { IPeopleDataSource } from './types';
import {
  UserModel,
  UserSkillModel,
  ConnectionModel,
  ChatModel,
} from '@db';
import { Person, PeopleFilterInput } from '../../types/generated';
import { AdvancedSearch } from '../../lib/advanced-search';

export default class PeopleDataSource implements IPeopleDataSource {
  loadPeople = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]> => {
    try {
      // Use aggregation pipeline for better performance
      const people = await UserModel.aggregate([
        // Stage 1: Pagination
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        // Stage 2: Project required fields
        {
          $project: {
            first_name: 1,
            last_name: 1,
            photo: 1,
            location_id: 1,
            title: 1,
            bio: 1
          }
        },
        // Stage 3: Lookup top skills
        {
          $lookup: {
            from: 'userskillmodels',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user_id', '$$userId'] },
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
        // Stage 4: Check connection status
        {
          $lookup: {
            from: 'connectionmodels',
            let: { 
              userId: '$_id', 
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
                          { $eq: ['$addressee_user_id', '$$userId'] }
                        ]
                      },
                      {
                        $and: [
                          { $eq: ['$requester_user_id', '$$userId'] },
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
        // Stage 5: Check chat if connection is accepted
        {
          $lookup: {
            from: 'chatmodels',
            let: { 
              userId: '$_id', 
              currentUserId: { $literal: current_user_id },
              connectionStatus: { $arrayElemAt: ['$connection.status', 0] }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$connectionStatus', 'accepted'] },
                      { $all: ['$participant_ids', ['$$currentUserId', { $toString: '$$userId' }]] }
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
        // Stage 6: Project final format
        {
          $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            photo: 1,
            location_id: 1,
            title: 1,
            bio: 1,
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

      return people;
    } catch (error) {
      console.error('Error in loadPeople:', error);
      // Fallback to original implementation
      const users = await UserModel.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .select('first_name last_name photo location_id title bio');

      const peopleWithTopSkills = await Promise.all(
        users.map(async (user) => {
          const topSkillsDocs = await UserSkillModel.find({
            user_id: user._id,
            is_top: true,
          })
            .limit(4)
            .lean();
          const topSkills = topSkillsDocs.map((skill) => ({
            ...skill,
            is_top: Boolean(skill.is_top),
          }));
          let is_connection = null;
          let chat_id = null;
          if (current_user_id && user._id.toString() !== current_user_id) {
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
          return {
            ...user.toObject(),
            top_skills: topSkills,
            is_connection,
            chat_id,
          };
        })
      );
      return peopleWithTopSkills;
    }
  };

  loadPeopleByFilter = async (
    filter: PeopleFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]> => {
    // Build query for UserModel
    const userQuery: any = {};
    if (filter.title) {
      userQuery.title = { $regex: filter.title, $options: 'i' };
    }

    // Find users matching the title (if any)
    let users = await UserModel.find(userQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('first_name last_name photo location_id title bio');

    // If skills filter is present, further filter users by their skills
    if (filter.skills && filter.skills.length > 0) {
      // Find user IDs who have at least one of the skills (relaxed matching)
      const skillRegexes = filter.skills.map((skill) => ({
        skill_name: { $regex: skill, $options: 'i' },
      }));
      const skillUsers = await UserSkillModel.find({
        $or: skillRegexes,
      }).distinct('user_id');
      users = users.filter((user: any) =>
        skillUsers.includes(user._id.toString())
      );
    }

    const peopleWithTopSkills = await Promise.all(
      users.map(async (user) => {
        const topSkillsDocs = await UserSkillModel.find({
          user_id: user._id,
          is_top: true,
        })
          .limit(4)
          .lean();
        const topSkills = topSkillsDocs.map((skill) => ({
          ...skill,
          is_top: Boolean(skill.is_top),
        }));
        let is_connection = null;
        let chat_id = null;
        if (current_user_id && user._id.toString() !== current_user_id) {
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
        return {
          ...user.toObject(),
          top_skills: topSkills,
          is_connection,
          chat_id,
        };
      })
    );
    return peopleWithTopSkills;
  };

  loadPersonById = async (
    id: string,
    current_user_id?: string
  ): Promise<Person> => {
    const user = await UserModel.findById(id).select(
      'first_name last_name photo location_id title bio'
    );
    if (!user) {
      throw new Error('Person not found');
    }
    const topSkillsDocs = await UserSkillModel.find({
      user_id: user._id,
      is_top: true,
    })
      .limit(4)
      .lean();
    const topSkills = topSkillsDocs.map((skill) => ({
      ...skill,
      is_top: Boolean(skill.is_top),
    }));
    let is_connection = null;
    let chat_id = null;
    if (current_user_id && user._id.toString() !== current_user_id) {
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
    return {
      ...user.toObject(),
      top_skills: topSkills,
      is_connection,
      chat_id,
    };
  };

  searchPeople = async (search, current_user_id) => {
    try {
      // Use the enhanced search engine
      const searchResults = await AdvancedSearch.searchUsers({
        query: search,
        limit: 20,
        page: 0,
      });

      // Convert search results to Person format
      const people: Person[] = [];

      for (const user of searchResults.data) {
        // Get top skills
        const topSkillsDocs = await UserSkillModel.find({
          user_id: user._id,
          is_top: true,
        })
          .limit(4)
          .lean();
        const topSkills = topSkillsDocs.map((skill) => ({
          ...skill,
          is_top: Boolean(skill.is_top),
        }));

        // Get connection and chat info
        let is_connection = null;
        let chat_id = null;
        if (current_user_id && user._id.toString() !== current_user_id) {
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

        people.push({
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          photo: user.photo,
          location_id: user.location_id,
          title: user.title,
          bio: user.bio,
          top_skills: topSkills,
          is_connection,
          chat_id,
        });
      }

      return people;
    } catch (error) {
      console.error('Error in searchPeople:', error);
      // Fallback to original implementation
      let users = [];
      if (search.length < 3) {
        // Use regex for prefix match
        users = await UserModel.find({
          $or: [
            { first_name: { $regex: `^${search}`, $options: 'i' } },
            { last_name: { $regex: `^${search}`, $options: 'i' } },
            { title: { $regex: `^${search}`, $options: 'i' } },
          ],
        })
          .select('first_name last_name photo location_id title bio')
          .lean();
      } else {
        // Use $text for full-text search
        users = await UserModel.aggregate([
          { $match: { $text: { $search: search } } },
          { $addFields: { score: { $meta: 'textScore' } } },
          { $sort: { score: -1 } },
        ]);
      }
      // Full-text search skills (always, for now)
      const skillUsers = await UserSkillModel.aggregate([
        { $match: { $text: { $search: search } } },
        { $group: { _id: '$user_id' } },
      ]);
      const skillUserIds = skillUsers.map((u) => u._id);
      // Merge users from both queries
      const userIds = new Set([
        ...users.map((u) => u._id?.toString()),
        ...skillUserIds.map((id) => id?.toString()),
      ]);
      const allUsers = await UserModel.find({ _id: { $in: Array.from(userIds) } })
        .select('first_name last_name photo location_id title bio')
        .lean();
      // Attach top skills, connection, and chat info
      const peopleWithTopSkills = await Promise.all(
        allUsers.map(async (user) => {
          const topSkillsDocs = await UserSkillModel.find({
            user_id: user._id,
            is_top: true,
          })
            .limit(4)
            .lean();
          const topSkills = topSkillsDocs.map((skill) => ({
            ...skill,
            is_top: Boolean(skill.is_top),
          }));
          let is_connection = null;
          let chat_id = null;
          if (current_user_id && user._id.toString() !== current_user_id) {
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
          return { ...user, top_skills: topSkills, is_connection, chat_id };
        })
      );
      return peopleWithTopSkills;
    }
  };
}
