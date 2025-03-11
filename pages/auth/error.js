import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Flex,
  Image
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

export default function AuthErrorPage() {
  const router = useRouter();
  const { error } = router.query;
  
  // Format error message
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'CallbackRouteError':
        return 'There was a problem with the login callback.';
      case 'SessionRequired':
        return 'You need to be signed in to access this page.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      case 'Verification':
        return 'The token has expired or is invalid.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  };
  
  const errorMessage = getErrorMessage(error);
  
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Image 
            src="/logo.png" 
            alt="Blood Bank Management System" 
            h="80px" 
            fallbackSrc="https://via.placeholder.com/150x80?text=Blood+Bank"
          />
          <Heading fontSize="2xl" textAlign="center" color="red.500">
            Authentication Error
          </Heading>
        </Stack>
        
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
          w={{ base: 'sm', md: 'md' }}
        >
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            {errorMessage}
          </Alert>
          
          <Stack spacing={6}>
            <Text>
              Please check your credentials and try again. If the problem persists, contact your system administrator.
            </Text>
            
            <NextLink href="/auth/login" passHref>
              <Button as="a" colorScheme="red">
                Return to Login
              </Button>
            </NextLink>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
