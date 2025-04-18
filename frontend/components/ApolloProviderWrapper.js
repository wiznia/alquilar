'use client';

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
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

const client = new ApolloClient({
  link: authLink.concat(uploadLink),
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
