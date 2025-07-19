import { IPeopleDataSource } from './types';
import { UserModel } from '@db'; // Assuming the User model is in @db
import { UserSkillModel } from '@db'; // Assuming the UserSkill model is in @db
import { Person, PeopleFilterInput } from '../../types/generated'; // Generated types from codegen
import { ConnectionModel, ChatModel } from '@db';

export default class PeopleDataSource implements IPeopleDataSource {
  loadPeople = async (
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]> => {
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
  };
}
