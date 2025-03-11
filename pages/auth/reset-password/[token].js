import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  InputGroup,
  InputRightElement,
  IconButton,
  Container,
  Flex,
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  const toast = useToast();

  useEffect(() => {
    // Validate token when component mounts
    const validateToken = async () => {
      if (token) {
        try {
          await axios.get(`/api/auth/reset-password/validate?token=${token}`);
          setValidToken(true);
        } catch (error) {
          setValidToken(false);
        }
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password
      });
      
      setResetComplete(true);
    } catch (error) {
      toast({
        title: 'Error resetting password',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Alert status="loading">
          <AlertIcon />
          Loading...
        </Alert>
      </Container>
    );
  }

  if (!validToken) {
    return (
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          This password reset link is invalid or has expired. Please request a new one.
        </Alert>
        <Box mt={4} textAlign="center">
          <NextLink href="/auth/forgot-password" passHref>
            <Button as="a" colorScheme="blue">
              Request New Link
            </Button>
          </NextLink>
        </Box>
      </Container>
    );
  }

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
            <Heading size="lg" mb={2}>Reset Your Password</Heading>
            <Text color="gray.600">Enter a new password for your account</Text>
          </Box>

          {resetComplete ? (
            <Box textAlign="center">
              <Alert status="success" borderRadius="md" mb={6}>
                <AlertIcon />
                Your password has been reset successfully!
              </Alert>
              <NextLink href="/auth/login" passHref>
                <Button as="a" colorScheme="blue" width="full">
                  Back to Login
                </Button>
              </NextLink>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  width="full"
                  mt={4}
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          )}
        </Box>
      </Flex>
    </Container>
  );
};

// Mark this as an auth page to avoid wrapping it in the MainLayout
ResetPasswordPage.authPage = true;

export default ResetPasswordPage;
