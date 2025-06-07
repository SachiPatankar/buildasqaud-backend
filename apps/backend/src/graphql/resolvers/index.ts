import { merge } from 'lodash';

import userResolvers from './user';
import s3Resolvers from './s3';
import hackathonResolvers from './hackathon';
import profileResolvers from './profile';
import peopleResolvers from './people';
import experienceResolvers from './experience';
import projectResolvers from './project';
import hackathonWinResolvers from './hackathonWin';
import friendResolvers from './friend';
import chatResolvers from './chat';

const resolvers = merge(
  userResolvers,
  s3Resolvers,
  hackathonResolvers,
  profileResolvers,
  peopleResolvers,
  experienceResolvers,
  projectResolvers,
  hackathonWinResolvers,
  friendResolvers,
  chatResolvers
);

export default resolvers;
