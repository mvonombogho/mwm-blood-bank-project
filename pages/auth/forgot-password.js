import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Link,
  Flex,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import NextLink from 'next/link';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Box
          py={{ base: '8', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
          width="100%"
        >
          <Box textAlign="center" mb={8}>
            <Heading size="lg" mb={2}>Forgot Password</Heading>
            <Text color="gray.600">Enter your email to receive a password reset link</Text>
          </Box>

          {success ? (
            <Alert status="success" borderRadius="md" mb={4}>
              <AlertIcon />
              If that email exists in our system, we've sent password reset instructions to {email}.
              Please check your inbox.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  width="full"
                >
                  Send Reset Link
                </Button>

                <Box alignSelf="center" pt={4}>
                  <NextLink href="/auth/login" passHref>
                    <Link color="blue.500">Back to login</Link>
                  </NextLink>
                </Box>
              </VStack>
            </form>
          )}
        </Box>
      </Flex>
    </Container>
  );
};

// Mark this as an auth page to avoid wrapping it in the MainLayout
ForgotPasswordPage.authPage = true;

export default ForgotPasswordPage;
