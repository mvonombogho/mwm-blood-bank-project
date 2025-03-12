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
  InputGroup,
  InputRightElement,
  Link
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationSecret, setRegistrationSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          registrationSecret
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Registration successful',
          description: 'You can now log in with your credentials',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/auth/login');
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={12}>
      <Box 
        p={8} 
        borderWidth={1} 
        borderRadius={8} 
        boxShadow="lg"
      >
        <VStack spacing={4} align="flex-start">
          <Heading size="lg">Create Admin Account</Heading>
          <Text>Register a new administrator account for the Blood Bank Management System</Text>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} align="flex-start" width="100%">
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name"
                />
              </FormControl>
              
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
                  <InputRightElement width="4.5rem">
                    <Button 
                      h="1.75rem" 
                      size="sm" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Registration Secret</FormLabel>
                <Input 
                  type="password" 
                  value={registrationSecret} 
                  onChange={(e) => setRegistrationSecret(e.target.value)} 
                  placeholder="Enter the registration secret"
                />
              </FormControl>
              
              <Button 
                colorScheme="blue" 
                width="100%" 
                mt={4} 
                type="submit"
                isLoading={isLoading}
              >
                Register
              </Button>
            </VStack>
          </form>
          
          <Box width="100%" pt={4}>
            <Text align="center">
              Already have an account?{' '}
              <NextLink href="/auth/login" passHref>
                <Link color="blue.500">Login</Link>
              </NextLink>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

// Mark this as an auth page to avoid layout wrapper and authentication checks
Register.authPage = true;

export default Register;