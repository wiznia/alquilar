import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AppProvider } from '../components/AppContext';
import { AuthProvider } from '../components/AuthContext';

export default function RootLayout({ children, auth, deletelisting }) {
  return (
    <html lang="es">
      <head>
        <title>Alquil.AR</title>
      </head>
      <body>
        <ApolloProviderWrapper>
          <AppProvider>
            <AuthProvider>
              <Page>
                {auth}
                {deletelisting}
                {children}
              </Page>
            </AuthProvider>
          </AppProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
