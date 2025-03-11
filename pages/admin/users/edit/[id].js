import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Stack,
  Select, Text, FormErrorMessage, useToast, SimpleGrid,
  Checkbox, CheckboxGroup, Switch, Divider, HStack, IconButton,
  Card, CardBody, CardHeader, useColorModeValue, Alert, AlertIcon
} from '@chakra-ui/react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import Layout from '../../../../components/Layout';
import AuthGuard from '../../../../components/auth/AuthGuard';
import axios from 'axios';

const EditUserPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query;
  
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePermissionChange = (permission, value) => {
    setUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };
  
  const handleRoleChange = (e) => {
    const { value } = e.target;
    
    // Define default permissions for each role
    const rolePermissions = {
      admin: {
        canManageDonors: true,
        canManageRecipients: true,
        canManageInventory: true,
        canGenerateReports: true,
        canManageUsers: true,
        canViewSensitiveData: true
      },
      manager: {
        canManageDonors: true,
        canManageRecipients: true,
        canManageInventory: true,
        canGenerateReports: true,
        canManageUsers: false,
        canViewSensitiveData: true
      },
      technician: {
        canManageDonors: false,
        canManageRecipients: false,
        canManageInventory: true,
        canGenerateReports: false,
        canManageUsers: false,
        canViewSensitiveData: false
      },
      donor_coordinator: {
        canManageDonors: true,
        canManageRecipients: false,
        canManageInventory: false,
        canGenerateReports: true,
        canManageUsers: false,
        canViewSensitiveData: false
      },
      staff: {
        canManageDonors: false,
        canManageRecipients: false,
        canManageInventory: false,
        canGenerateReports: false,
        canManageUsers: false,
        canViewSensitiveData: false
      }
    };
    
    // Update role and permissions
    setUser(prev => ({
      ...prev,
      role: value,
      permissions: rolePermissions[value]
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      const response = await axios.put(`/api/users/${id}`, user);
      
      toast({
        title: 'User Updated',
        description: 'User data has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect back to users list
      router.push('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'An error occurred while updating the user.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Edit User">
        <Box maxW="7xl" mx="auto" textAlign="center" py={12}>
          <Text>Loading user data...</Text>
        </Box>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout title="Edit User">
        <Box maxW="7xl" mx="auto" textAlign="center" py={12}>
          <Text color="red.500">User not found.</Text>
          <Button 
            mt={4} 
            colorScheme="red" 
            onClick={() => router.push('/admin/users')}
          >
            Back to Users
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <AuthGuard requiredPermissions={{ canManageUsers: true }}>
      <Layout title="Edit User">
        <Box maxW="7xl" mx="auto">
          <HStack mb={6} spacing={4}>
            <IconButton
              icon={<FaArrowLeft />}
              aria-label="Back to users"
              onClick={() => router.push('/admin/users')}
              variant="ghost"
            />
            <Heading as="h1" size="xl">Edit User</Heading>
          </HStack>
          
          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">User Information</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <FormControl id="name">
                      <FormLabel>Full Name</FormLabel>
                      <Input 
                        name="name" 
                        value={user.name} 
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    
                    <FormControl id="email">
                      <FormLabel>Email Address</FormLabel>
                      <Input 
                        name="email" 
                        value={user.email} 
                        onChange={handleInputChange}
                        isReadOnly
                      />
                    </FormControl>
                    
                    <HStack>
                      <FormControl id="contactNumber">
                        <FormLabel>Contact Number</FormLabel>
                        <Input 
                          name="contactNumber" 
                          value={user.contactNumber || ''} 
                          onChange={handleInputChange}
                        />
                      </FormControl>
                      
                      <FormControl id="department">
                        <FormLabel>Department</FormLabel>
                        <Input 
                          name="department" 
                          value={user.department || ''} 
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </HStack>
                    
                    <FormControl id="role">
                      <FormLabel>Role</FormLabel>
                      <Select 
                        name="role" 
                        value={user.role} 
                        onChange={handleRoleChange}
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="donor_coordinator">Donor Coordinator</option>
                        <option value="staff">Staff</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl id="status">
                      <FormLabel>Status</FormLabel>
                      <Select 
                        name="status" 
                        value={user.status} 
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </Select>
                    </FormControl>
                  </Stack>
                </form>
              </CardBody>
            </Card>
            
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Permissions</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4} fontSize="sm" color="gray.500">
                  Permissions are automatically set based on role, but can be customized if needed.
                </Text>
                
                <Stack spacing={3}>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="manage-donors" 
                      isChecked={user.permissions.canManageDonors}
                      onChange={(e) => handlePermissionChange('canManageDonors', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="manage-donors" mb={0}>
                      Manage Donors
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="manage-recipients" 
                      isChecked={user.permissions.canManageRecipients}
                      onChange={(e) => handlePermissionChange('canManageRecipients', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="manage-recipients" mb={0}>
                      Manage Recipients
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="manage-inventory" 
                      isChecked={user.permissions.canManageInventory}
                      onChange={(e) => handlePermissionChange('canManageInventory', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="manage-inventory" mb={0}>
                      Manage Inventory
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="generate-reports" 
                      isChecked={user.permissions.canGenerateReports}
                      onChange={(e) => handlePermissionChange('canGenerateReports', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="generate-reports" mb={0}>
                      Generate Reports
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="manage-users" 
                      isChecked={user.permissions.canManageUsers}
                      onChange={(e) => handlePermissionChange('canManageUsers', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="manage-users" mb={0}>
                      Manage Users
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="view-sensitive-data" 
                      isChecked={user.permissions.canViewSensitiveData}
                      onChange={(e) => handlePermissionChange('canViewSensitiveData', e.target.checked)}
                      mr={3}
                      colorScheme="red"
                    />
                    <FormLabel htmlFor="view-sensitive-data" mb={0}>
                      View Sensitive Data
                    </FormLabel>
                  </FormControl>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <HStack spacing={4} mt={8} justifyContent="flex-end">
            <Button 
              onClick={() => router.push('/admin/users')} 
              leftIcon={<FaTimes />}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleSubmit} 
              leftIcon={<FaSave />}
              isLoading={isSaving}
              loadingText="Saving"
            >
              Save Changes
            </Button>
          </HStack>
        </Box>
      </Layout>
    </AuthGuard>
  );
};

export default EditUserPage;
