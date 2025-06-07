import { HackathonInterest, HackathonInterestStatus } from '@db';
import { IHackathonInterestDataSource } from './types';

export default class InterestSource implements IHackathonInterestDataSource {
  interested = async (hackathonId: string, userId: string) =>
    HackathonInterest.findOneAndUpdate(
      { hackathon_id: hackathonId, user_id: userId },
      { status: HackathonInterestStatus.INTERESTED },
      { upsert: true, new: true }
    );

  uninterested = async (hackathonId: string, userId: string) =>
    HackathonInterest.findOneAndUpdate(
      { hackathon_id: hackathonId, user_id: userId },
      { status: HackathonInterestStatus.UNINTERESTED },
      { upsert: true, new: true }
    );
}
