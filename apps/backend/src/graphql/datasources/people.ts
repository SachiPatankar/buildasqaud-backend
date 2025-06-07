import { User } from '@db';
import { IPeopleDataSource } from './types';

export default class PeopleSource implements IPeopleDataSource {
  getPeopleWithProfile = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const result = await User.aggregate([
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'user_id',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          first_name: 1,
          last_name: 1,
          photo: 1,
          'profile.title': 1,
          'profile.bio': 1,
          created_at: 1,
        },
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      _id: r._id,
      first_name: r.first_name,
      last_name: r.last_name,
      photo: r.photo,
      created_at: r.created_at,
      profile: {
        title: r.profile?.title || null,
        bio: r.profile?.bio || null,
      },
    }));
  };
}
