import { IPeopleDataSource } from './types';
import { UserModel } from '@db'; // Assuming the User model is in @db
import { UserSkillModel } from '@db'; // Assuming the UserSkill model is in @db
import { Person, PeopleFilterInput } from '../../types/generated'; // Generated types from codegen
import { ConnectionModel } from '@db';

export default class PeopleDataSource implements IPeopleDataSource {
  async loadPeople(
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]> {
    const users = await UserModel.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .select('first_name last_name photo location_id title bio');

    const peopleWithTopSkills = await Promise.all(
      users.map(async (user) => {
        const topSkills = await UserSkillModel.find({
          user_id: user._id,
          is_top: true,
        }).limit(4);
        let is_connection = null;
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
        }
        return {
          ...user.toObject(),
          top_skills: topSkills,
          is_connection,
        };
      })
    );
    return peopleWithTopSkills;
  }

  async loadPeopleByFilter(
    filter: PeopleFilterInput,
    page: number,
    limit: number,
    current_user_id: string
  ): Promise<Person[]> {
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
      // Find user IDs who have at least one of the skills
      const skillUsers = await UserSkillModel.find({
        skill_name: { $in: filter.skills },
      }).distinct('user_id');
      users = users.filter((user: any) =>
        skillUsers.includes(user._id.toString())
      );
    }

    const peopleWithTopSkills = await Promise.all(
      users.map(async (user) => {
        const topSkills = await UserSkillModel.find({
          user_id: user._id,
          is_top: true,
        }).limit(4);
        let is_connection = null;
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
        }
        return {
          ...user.toObject(),
          top_skills: topSkills,
          is_connection,
        };
      })
    );
    return peopleWithTopSkills;
  }

  async loadPersonById(id: string): Promise<Person> {
    const user = await UserModel.findById(id).select(
      'first_name last_name photo location_id title bio'
    );
    if (!user) {
      throw new Error('Person not found');
    }
    const topSkills = await UserSkillModel.find({
      user_id: user._id,
      is_top: true,
    }).limit(4);
    return {
      ...user.toObject(),
      top_skills: topSkills,
    };
  }
}
