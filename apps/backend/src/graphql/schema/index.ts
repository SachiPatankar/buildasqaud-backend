import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import userSchema from './user';
import s3Schema from './s3';
import postSchema from './post';

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
  postSchema

 
);

export default typeDefs;
