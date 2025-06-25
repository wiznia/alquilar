import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from '../typeDefs.js';
import resolvers from '../resolvers.js';
import { pubsub } from '../pubsub.js';

export const createApolloServer = async (httpServer) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  useServer(
    {
      schema,
      context: async () => ({ pubsub }),
    },
    wsServer,
  );

  return expressMiddleware(server, {
    context: async ({ req, res }) => ({ req, res, pubsub }),
  });
};
