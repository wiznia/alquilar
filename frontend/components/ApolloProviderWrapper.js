'use client';

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  split,
} from '@apollo/client';
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; authToken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const authLink = setContext((_, prevContext) => {
  const token = getTokenFromCookie();
  return {
    headers: {
      ...prevContext?.headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-apollo-operation-name': 'uploadFiles',
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_WS_URL,
    connectionParams: () => {
      const token = getTokenFromCookie();
      return {
        headers: {
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(uploadLink),
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      SingleMessage: {
        keyFields: ['messageId'],
      },
      Message: {
        keyFields: ['conversationId'],
      },
    },
  }),
});

export default function ApolloProviderWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
