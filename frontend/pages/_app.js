import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import Page from '../components/Page';
import '../styles/styles.css';

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Page>
        <Component {...pageProps} />
      </Page>
    </ApolloProvider>
  );
}
