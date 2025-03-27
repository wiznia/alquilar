'use client';

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_BACKEND_URL,
});

const authLink = setContext((_, prevContext) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
  cache: new InMemoryCache(),
});

export default function ApolloProviderWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
