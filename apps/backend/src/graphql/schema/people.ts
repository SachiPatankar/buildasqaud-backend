import gql from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type Person {
    _id: String!
    first_name: String!
    last_name: String
    photo: String
    location_id: String
    title: String
    bio: String
    top_skills: [UserSkill] 
  }

  input PeopleFilterInput {
    first_name: String
    last_name: String
    location_id: String
    title: String
    skills: [String] 
  }

  extend type Query {
    loadPeople(page: Int, limit: Int): [Person]!
    loadPeopleByFilter(filter: PeopleFilterInput!, page: Int, limit: Int): [Person]!
  }
`;

export default typeDefs;
