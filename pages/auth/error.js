import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import NextLink from 'next/link';

const AuthErrorPage = () => {
  const router = useRouter();
  const { error } = router.query;
  
  // Define all possible errors
  const errors = {
    default: {
      title: 'Authentication Error',
      message: 'An error occurred during authentication. Please try again.',
    },
    accessdenied: {
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
    },
    verification: {
      title: 'Verification Error',
      message: 'The verification link is invalid or has expired.',
    },
    credentialssignin: {
      title: 'Sign In Failed',
      message: 'The email or password you entered is incorrect.',
    },
    sessionrequired: {
      title: 'Authentication Required',
      message: 'You must be signed in to access this page.',
    },
    accountnotlinked: {
      title: 'Account Not Linked',
      message: 'Your account is not linked to this authentication method.',
    },
    configuration: {
      title: 'Server Error',
      message: 'There is a problem with the server configuration. Please contact support.',
    },
  };
  
  // Get error details or use default
  const errorDetails = error && errors[error.toLowerCase()] ? errors[error.toLowerCase()] : errors.default;
  
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Box
        py={{ base: '8', sm: '8' }}
        px={{ base: '4', sm: '10' }}
        bg="white"
        boxShadow={{ base: 'none', sm: 'md' }}
        borderRadius={{ base: 'none', sm: 'xl' }}
      >
        <VStack spacing={6} align="stretch" textAlign="center">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {errorDetails.title}
            </AlertTitle>
            <AlertDescription maxWidth="md">
              {errorDetails.message}
            </AlertDescription>
          </Alert>
          
          <Box>
            <Heading size="md" mb={2}>What would you like to do next?</Heading>
            
            <NextLink href="/auth/login" passHref>
              <Button as="a" colorScheme="blue" width="full" mb={3}>
                Try signing in again
              </Button>
            </NextLink>
            
            <NextLink href="/auth/forgot-password" passHref>
              <Button as="a" variant="outline" width="full" mb={3}>
                Reset your password
              </Button>
            </NextLink>
            
            <Text mt={4} fontSize="sm" color="gray.500">
              If you continue to experience issues, please contact your system administrator.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

// Mark this as an auth page to avoid wrapping it in the MainLayout
AuthErrorPage.authPage = true;

export default AuthErrorPage;
