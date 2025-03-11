import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import MainLayout from '../components/layout/MainLayout';
import NextNProgress from 'nextjs-progressbar';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Check if the page is an auth page (login, register, etc.)
  const isAuthPage = Component.authPage || false;
  
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <CSSReset />
        <NextNProgress color="#3182CE" options={{ showSpinner: false }} />
        
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )}
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
