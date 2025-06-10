import { merge } from 'lodash';

import userResolvers from './user';
import s3Resolvers from './s3';
import postResolvers from './post';
import applyResolvers from './apply';
import profileResolvers from './profile';
// import connectionResolvers from './connection';


const resolvers = merge(userResolvers, s3Resolvers, postResolvers, applyResolvers , profileResolvers);

export default resolvers;
