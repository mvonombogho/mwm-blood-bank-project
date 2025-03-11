import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Grid,
  GridItem,
  Divider,
  Badge,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const ProfilePage = () => {
  const { data: session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    department: '',
    contactNumber: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If session exists, fetch user data
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${session.user.id}`);
      setUserData(response.data);
      setUserForm({
        name: response.data.name || '',
        email: response.data.email || '',
        department: response.data.department || '',
        contactNumber: response.data.contactNumber || '',
      });
    } catch (error) {
      toast({
        title: 'Error fetching profile',
        description: error.response?.data?.message || 'Could not load user data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(`/api/users/${session.user.id}`, userForm);
      
      setUserData(response.data);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Could not update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Confirm passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirm password must match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error changing password',
        description: error.response?.data?.message || 'Could not change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Container maxW="container.lg" py="8">
        <Heading mb="6">My Profile</Heading>
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList mb="1em">
            <Tab>Profile Information</Tab>
            <Tab>Security</Tab>
          </TabList>
          
          <TabPanels>
            {/* Profile Information Tab */}
            <TabPanel>
              <Box bg="white" p="6" borderRadius="md" boxShadow="sm">
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Heading size="md" mb="4">Basic Information</Heading>
                    <Divider mb="4" />
                  </GridItem>
                  
                  <GridItem>
                    <Text fontWeight="bold">Role</Text>
                    <Badge colorScheme="blue" mt="1" fontSize="0.9em" p="1">
                      {userData?.role === 'admin' ? 'Administrator' :
                       userData?.role === 'manager' ? 'Manager' :
                       userData?.role === 'technician' ? 'Technician' :
                       userData?.role === 'donor_coordinator' ? 'Donor Coordinator' : 'Staff'}
                    </Badge>
                  </GridItem>
                  
                  <GridItem>
                    <Text fontWeight="bold">Member Since</Text>
                    <Text mt="1">
                      {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Divider my="4" />
                    <Heading size="md" mb="4">Edit Profile</Heading>
                  </GridItem>
                </Grid>
                
                <form onSubmit={updateProfile}>
                  <VStack spacing="4" align="start">
                    <FormControl id="name">
                      <FormLabel>Name</FormLabel>
                      <Input
                        name="name"
                        value={userForm.name}
                        onChange={handleUserFormChange}
                      />
                    </FormControl>
                    
                    <FormControl id="email">
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={userForm.email}
                        onChange={handleUserFormChange}
                      />
                    </FormControl>
                    
                    <FormControl id="department">
                      <FormLabel>Department</FormLabel>
                      <Input
                        name="department"
                        value={userForm.department}
                        onChange={handleUserFormChange}
                      />
                    </FormControl>
                    
                    <FormControl id="contactNumber">
                      <FormLabel>Contact Number</FormLabel>
                      <Input
                        name="contactNumber"
                        value={userForm.contactNumber}
                        onChange={handleUserFormChange}
                      />
                    </FormControl>
                    
                    <Button
                      mt="4"
                      colorScheme="blue"
                      type="submit"
                      isLoading={loading}
                    >
                      Save Changes
                    </Button>
                  </VStack>
                </form>
              </Box>
            </TabPanel>
            
            {/* Security Tab */}
            <TabPanel>
              <Box bg="white" p="6" borderRadius="md" boxShadow="sm">
                <Heading size="md" mb="4">Change Password</Heading>
                <Divider mb="4" />
                
                <form onSubmit={changePassword}>
                  <VStack spacing="4" align="start">
                    <FormControl id="currentPassword" isRequired>
                      <FormLabel>Current Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            variant="ghost"
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    
                    <FormControl id="newPassword" isRequired>
                      <FormLabel>New Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            variant="ghost"
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    
                    <FormControl id="confirmPassword" isRequired>
                      <FormLabel>Confirm New Password</FormLabel>
                      <InputGroup>
                        <Input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
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
                      mt="4"
                      colorScheme="blue"
                      type="submit"
                      isLoading={loading}
                    >
                      Change Password
                    </Button>
                  </VStack>
                </form>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
};

export default ProfilePage;
