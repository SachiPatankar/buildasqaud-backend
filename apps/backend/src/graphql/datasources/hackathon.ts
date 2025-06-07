import { Hackathon, HackathonInterest, HackathonInterestStatus } from '@db';
import { IHackathonDataSource } from './types';
import { GraphQLError } from 'graphql';

export default class HackathonSource implements IHackathonDataSource {
  getAllHackathons = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const hackathons = await Hackathon.aggregate([
      { $sort: { created_at: -1 } },
      // join interests
      {
        $lookup: {
          from: 'hackathoninterests',
          localField: '_id',
          foreignField: 'hackathon_id',
          as: 'interests',
        },
      },
      // count only INTERESTED
      {
        $addFields: {
          interestedCount: {
            $size: {
              $filter: {
                input: '$interests',
                as: 'i',
                cond: {
                  $eq: ['$$i.status', HackathonInterestStatus.INTERESTED],
                },
              },
            },
          },
        },
      },
      // pagination
      { $skip: skip },
      { $limit: limit },
      { $project: { interests: 0 } },
    ]);

    return hackathons.map((h) => ({
      id: h._id,
      title: h.title,
      description: h.description,
      location_id: h.location_id,
      url: h.url,
      creator_id: h.creator_id,
      interestedCount: h.interestedCount,
      created_at: h.created_at,
      updated_at: h.updated_at,
    }));
  };

  // 2) getHackathonById
  getHackathonById = async (hackathonId: string) => {
    const [h] = await Hackathon.aggregate([
      { $match: { _id: hackathonId } },
      {
        $lookup: {
          from: 'hackathoninterests',
          localField: '_id',
          foreignField: 'hackathon_id',
          as: 'interests',
        },
      },
      {
        $addFields: {
          interestedCount: {
            $size: {
              $filter: {
                input: '$interests',
                as: 'i',
                cond: {
                  $eq: ['$$i.status', HackathonInterestStatus.INTERESTED],
                },
              },
            },
          },
        },
      },
      { $project: { interests: 0 } },
    ]);
    return (
      h && {
        id: h._id,
        title: h.title,
        description: h.description,
        location_id: h.location_id,
        url: h.url,
        creator_id: h.creator_id,
        interestedCount: h.interestedCount,
        created_at: h.created_at,
        updated_at: h.updated_at,
      }
    );
  };

  // 3) createHackathon
  createHackathon = async (
    input: {
      title: string;
      description?: string;
      location_id?: string;
      url?: string;
    },
    creatorId: string
  ) => {
    const hack = new Hackathon({ ...input, creator_id: creatorId });
    return hack.save();
  };

  // 4) updateHackathon (creator only)
  updateHackathon = async (
    hackathonId: string,
    input: {
      title?: string;
      description?: string;
      location_id?: string;
      url?: string;
    },
    creatorId: string
  ) => {
    const hack = await Hackathon.findById(hackathonId);
    if (!hack) throw new GraphQLError('Hackathon not found');
    if (hack.creator_id !== creatorId)
      throw new GraphQLError('Not authorized to update');
    Object.assign(hack, input);
    return hack.save();
  };
}
