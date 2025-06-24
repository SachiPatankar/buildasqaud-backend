import { IPeopleDataSource } from './types';
import { UserModel } from '@db'; // Assuming the User model is in @db
import { UserSkillModel } from '@db'; // Assuming the UserSkill model is in @db
import { Person, PeopleFilterInput } from '../../types/generated'; // Generated types from codegen

export default class PeopleDataSource implements IPeopleDataSource {
  async loadPeople(page: number, limit: number): Promise<Person[]> {
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

        return {
          ...user.toObject(),
          top_skills: topSkills,
        };
      })
    );

    return peopleWithTopSkills;
  }

  async loadPeopleByFilter(
    filter: PeopleFilterInput,
    page: number,
    limit: number
  ): Promise<Person[]> {
    const query = UserModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('first_name last_name photo location_id title bio');

    const users = await query;

    const peopleWithTopSkills = await Promise.all(
      users.map(async (user) => {
        const topSkills = await UserSkillModel.find({
          user_id: user._id,
          is_top: true,
        }).limit(4);

        return {
          ...user.toObject(),
          top_skills: topSkills,
        };
      })
    );

    return peopleWithTopSkills;
  }

  async loadPersonById(id: string): Promise<Person> {
    const user = await UserModel.findById(id).select('first_name last_name photo location_id title bio');
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
