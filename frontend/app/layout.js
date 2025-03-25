import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AppProvider } from '../components/AppContext';
import { AuthProvider } from '../components/AuthContext';

export default function RootLayout({ children, auth, confirmDelete }) {
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
                {confirmDelete}
                {children}
              </Page>
            </AuthProvider>
          </AppProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
