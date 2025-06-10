import express, { application } from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import cors from 'cors';

import { connectMongoDB } from '@db';
import routes from './routes';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloContext } from './graphql/types';
import { getCurrentUserFromReq } from './graphql/auth';
import { initSocket } from '@socket';

import UserDataSource from './graphql/datasources/user';
import S3DataSource from './graphql/datasources/s3';
import PostDataSource from './graphql/datasources/post';
import SavedPostDataSource from './graphql/datasources/saved-post';
import ApplicationDataSource from './graphql/datasources/apply';
import ProfileDataSource from './graphql/datasources/profile';
import ConnectionDataSource from './graphql/datasources/connection';

const HOST = process.env.HOST ?? 'localhost';
const PORT = process.env.PORT || 3000;

async function startServer() {
  dotenv.config();
  const app = express();

  try {
    await connectMongoDB();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    );

    const dataSource = {
      user: new UserDataSource(),
      s3: new S3DataSource(),
      post: new PostDataSource(),
      savedPost: new SavedPostDataSource(),
      application: new ApplicationDataSource(),
      profile: new ProfileDataSource(),
      connection: new ConnectionDataSource(),
    };

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const apolloServer = new ApolloServer<ApolloContext>({
      schema,
    });
    await apolloServer.start();

    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => {
          const currentUser = await getCurrentUserFromReq(req);

          return {
            dataSources: dataSource,
            currentUser, // { id, email }
            req,
          };
        },
      })
    );

    app.use(routes);

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 HTTP + WS server running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

(async () => {
  await startServer();
})();
