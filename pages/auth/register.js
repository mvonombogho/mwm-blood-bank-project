import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  useToast,
  IconButton,
  Select,
  Checkbox,
  Link,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const router = useRouter();
  const toast = useToast();
  const { isAdmin } = router.query; // Allow first user to be admin
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
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
    
    if (!agreeToTerms) {
      toast({
        title: 'Terms agreement required',
        description: 'You must agree to the terms and conditions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user
      await axios.post('/api/users/register', {
        name,
        email,
        password,
        role: isAdmin ? 'admin' : role,
        department,
      });
      
      toast({
        title: 'Registration successful',
        description: 'You can now sign in with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong',
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
            <Heading size="lg" mb={2}>
              {isAdmin ? 'Create Admin Account' : 'Register New User'}
            </Heading>
            <Text color="gray.600">
              {isAdmin ? 'Set up the first administrator account' : 'Join the Blood Bank Management System'}
            </Text>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
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
                    placeholder="Create a password"
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
                    placeholder="Confirm your password"
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
              
              {!isAdmin && (
                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="staff">Staff</option>
                    <option value="technician">Technician</option>
                    <option value="donor_coordinator">Donor Coordinator</option>
                    <option value="manager">Manager</option>
                  </Select>
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter your department (optional)"
                />
              </FormControl>
              
              <FormControl>
                <Checkbox
                  isChecked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                >
                  I agree to the terms and conditions
                </Checkbox>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                width="full"
                mt={4}
                isDisabled={!agreeToTerms}
              >
                {isAdmin ? 'Create Admin Account' : 'Register'}
              </Button>
              
              {!isAdmin && (
                <Text mt={4}>
                  Already have an account?{' '}
                  <NextLink href="/auth/login" passHref>
                    <Link color="blue.500">Sign in</Link>
                  </NextLink>
                </Text>
              )}
            </VStack>
          </form>
        </Box>
      </Flex>
    </Container>
  );
};

// Mark this as an auth page to avoid wrapping it in the MainLayout
RegisterPage.authPage = true;

export default RegisterPage;
