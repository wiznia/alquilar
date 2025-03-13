import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AppProvider } from '../components/AppContext';

export default function RootLayout({ children, auth }) {
  return (
    <html lang="es">
      <head>
        <title>Alquil.AR</title>
      </head>
      <body>
        <ApolloProviderWrapper>
          <AppProvider>
            <Page>
              {auth}
              {children}
            </Page>
          </AppProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
