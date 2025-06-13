import { merge } from 'lodash';

import userResolvers from './user';
import s3Resolvers from './s3';
import postResolvers from './post';
import applyResolvers from './apply';
import profileResolvers from './profile';
import connectionResolvers from './connection';
import peopleResolvers from './people';
import chatResolvers from './chat';

const resolvers = merge(
  userResolvers,
  s3Resolvers,
  postResolvers,
  applyResolvers,
  profileResolvers,
  connectionResolvers,
  peopleResolvers,
  chatResolvers
);

export default resolvers;
