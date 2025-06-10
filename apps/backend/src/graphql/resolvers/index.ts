import { merge } from 'lodash';

import userResolvers from './user';
import s3Resolvers from './s3';
import postResolvers from './post';


const resolvers = merge(
  userResolvers,
  s3Resolvers,
  postResolvers

);

export default resolvers;
