import gql from 'graphql-tag';

const typeDefs = gql`
  type PersonProfile {
    title: String
    bio: String
  }

  type Person {
    _id: String!
    first_name: String
    last_name: String
    photo: String
    profile: PersonProfile
    created_at: String
  }

  extend type Query {
    getPeople(page: Int, limit: Int): [Person!]!
  }
`;

export default typeDefs;
