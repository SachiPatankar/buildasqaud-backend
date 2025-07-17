import { ApolloContext } from '../types';
import { Person, PeopleFilterInput } from '../../types/generated'; // Generated types from codegen

const resolvers = {
  Query: {
    // Query to load a list of people (limited fields)
    loadPeople: async (
      _: any,
      { page = 1, limit = 10 }: { page: number; limit: number },
      context: ApolloContext
    ): Promise<Person[]> => {
      return context.dataSources.people.loadPeople(
        page,
        limit,
        context.currentUser.id
      );
    },

    // Query to load a list of people filtered by criteria
    loadPeopleByFilter: async (
      _: any,
      {
        filter,
        page = 1,
        limit = 10,
      }: { filter: PeopleFilterInput; page: number; limit: number },
      context: ApolloContext
    ): Promise<Person[]> => {
      return context.dataSources.people.loadPeopleByFilter(
        filter,
        page,
        limit,
        context.currentUser.id
      );
    },

    // Query to load a single person by ID
    loadPersonById: async (
      _: any,
      { id }: { id: string },
      context: ApolloContext
    ): Promise<Person> => {
      return context.dataSources.people.loadPersonById(id);
    },
    searchPeople: async (
      _: any,
      { search }: { search: string },
      context: ApolloContext
    ): Promise<Person[]> => {
      return context.dataSources.people.searchPeople(search, context.currentUser.id);
    },
  },
};

export default resolvers;
