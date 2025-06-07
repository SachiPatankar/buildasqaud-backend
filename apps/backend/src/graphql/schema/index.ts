import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import userSchema from './user';
import s3Schema from './s3';
import hackathonSchema from './hackathon';
import profileSchema from './profile';
import peopleSchema from './people';
import experienceSchema from './experience';
import projectSchema from './project';
import hackathonWinSchema from './hackathonWin';
import friendSchema from './friend';
import chatSchema from './chat';

const rootDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

const typeDefs: DocumentNode[] = [];
typeDefs.push(
  rootDefs,
  userSchema,
  s3Schema,
  hackathonSchema,
  profileSchema,
  peopleSchema,
  experienceSchema,
  projectSchema,
  hackathonWinSchema,
  friendSchema,
  chatSchema
);

export default typeDefs;
