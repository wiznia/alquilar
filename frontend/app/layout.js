import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AuthProvider } from '../components/AuthContext';

export default function RootLayout({ children, auth, modal }) {
  return (
    <html lang="es">
      <head>
        <title>Alquil.AR</title>
      </head>
      <body>
        <ApolloProviderWrapper>
          <AuthProvider>
            <Page>
              {children}
              {auth}
              {modal}
            </Page>
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
