import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import Navbar from '@/components/layout/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Navbar />
      <Box as="main" pt="16">
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;