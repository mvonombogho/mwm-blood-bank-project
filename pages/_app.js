import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import MainLayout from '../components/layout/MainLayout';
import NextNProgress from 'nextjs-progressbar';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/print.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Check if the page is an auth page (login, register, etc.)
  const isAuthPage = Component.authPage || false;
  
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Blood Bank Management System</title>
        </Head>
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
