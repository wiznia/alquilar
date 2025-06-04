import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AuthProvider } from '../components/AuthContext';
import { ToastProvider } from '@/components/ToastContext';

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
              <ToastProvider>
                {children}
                {auth}
                {modal}
              </ToastProvider>
            </Page>
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
