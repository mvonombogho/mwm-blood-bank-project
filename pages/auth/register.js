import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
  Select,
  Flex,
  Image,
  HStack
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import NextLink from 'next/link';
import axios from 'axios';
import { getSession } from 'next-auth/react';

export default function RegisterPage({ isAdmin = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    department: '',
    contactNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      // Send registration request
      const response = await axios.post('/api/users/register', userData);
      
      setSuccess(true);
      setIsLoading(false);
      
      // Navigate after 2 seconds if admin, otherwise go to login
      setTimeout(() => {
        if (isAdmin) {
          router.push('/admin/users');
        } else {
          router.push('/auth/login');
        }
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
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
            {isAdmin ? 'Create New User Account' : 'Register New Account'}
          </Heading>
          <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
            {isAdmin ? 'Add a new staff member to the system' : 'Join the Blood Bank Management System'}
          </Text>
        </Stack>
        
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
          w={{ base: 'sm', md: 'md' }}
        >
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert status="success" mb={4} borderRadius="md">
              <AlertIcon />
              Registration successful! {isAdmin ? 'User has been created.' : 'You can now login to your account.'}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <HStack spacing={4}>
                  <FormControl id="contactNumber">
                    <FormLabel>Contact Number</FormLabel>
                    <Input 
                      name="contactNumber" 
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl id="department">
                    <FormLabel>Department</FormLabel>
                    <Input 
                      name="department" 
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </FormControl>
                </HStack>
                
                {isAdmin && (
                  <FormControl id="role" isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      name="role" 
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="staff">Staff</option>
                      <option value="technician">Technician</option>
                      <option value="donor_coordinator">Donor Coordinator</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </Select>
                  </FormControl>
                )}
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <InputRightElement>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        onClick={togglePasswordVisibility}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <Stack spacing={6} pt={2}>
                  <Button
                    colorScheme="red"
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Submitting"
                  >
                    {isAdmin ? 'Create Account' : 'Register'}
                  </Button>
                  
                  {!isAdmin && (
                    <Text align="center">
                      Already have an account?{' '}
                      <NextLink href="/auth/login" passHref>
                        <Link color="blue.500">
                          Login here
                        </Link>
                      </NextLink>
                    </Text>
                  )}
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Stack>
    </Flex>
  );
}

// Server-side protection for regular registration
export async function getServerSideProps(context) {
  const { req, query } = context;
  const { isAdmin } = query;
  const session = await getSession({ req });
  
  // If isAdmin flag is present, check if the user is an admin
  if (isAdmin === 'true') {
    // Redirect to login if not authenticated
    if (!session) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
    
    // Redirect to home if not an admin
    if (session.user.role !== 'admin' && !session.user.permissions.canManageUsers) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    
    return {
      props: { isAdmin: true },
    };
  }
  
  // If public registration is disabled, redirect non-admins
  // In a real app, you might want to control this via environment variable
  const PUBLIC_REGISTRATION_ENABLED = false;
  
  if (!PUBLIC_REGISTRATION_ENABLED) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: { isAdmin: false },
  };
}
