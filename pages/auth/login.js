import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
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
  Link,
  Container,
  Flex,
  Image
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        toast({
          title: 'Authentication error',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Redirect to the intended destination or dashboard
        const callbackUrl = router.query.callbackUrl || '/';
        router.push(callbackUrl);
      }
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: error.message || 'Please try again later',
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
            <Heading size="lg" mb={2}>Welcome to Blood Bank Management System</Heading>
            <Text color="gray.600">Sign in to your account</Text>
          </Box>

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

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <Box alignSelf="flex-end">
                <NextLink href="/auth/forgot-password" passHref>
                  <Link color="blue.500">Forgot password?</Link>
                </NextLink>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                width="full"
              >
                Sign in
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Container>
  );
};

export default LoginPage;
