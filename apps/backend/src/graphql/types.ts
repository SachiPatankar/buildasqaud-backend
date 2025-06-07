import { IDataSource } from './datasources/types';

export interface ApolloContext {
  dataSources: IDataSource;
  currentUser: { id: string; email: string };
}
