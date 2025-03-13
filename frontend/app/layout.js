import '../styles/styles.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import Page from '../components/Page';
import { AppProvider } from '../components/AppContext';

export default function RootLayout({ children, modal }) {
  return (
    <html lang="es">
      <head>
        <title>Alquil.AR</title>
      </head>
      <body>
        <ApolloProviderWrapper>
          <AppProvider>
            <Page>
              {modal}
              {children}
            </Page>
          </AppProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
