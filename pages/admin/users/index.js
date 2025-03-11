import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useDisclosure,
  useToast,
  Text,
  Stack,
  InputGroup,
  InputLeftElement,
  Input,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import UserModal from '../../../components/admin/UserModal';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';

const UserManagementPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // User form state for create/edit
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: '',
    contactNumber: '',
  });
  
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // User modal
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  
  // Delete confirmation dialog
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/users?page=${page}&limit=${pagination.limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await axios.get(url);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error.response?.data?.message || 'Could not load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, searchTerm);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchTerm); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage, searchTerm);
  };

  const handleCreateUser = () => {
    setFormMode('create');
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      department: '',
      contactNumber: '',
    });
    onUserModalOpen();
  };

  const handleEditUser = (user) => {
    setFormMode('edit');
    setCurrentUserId(user._id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role,
      department: user.department || '',
      contactNumber: user.contactNumber || '',
    });
    onUserModalOpen();
  };

  const handleDeleteUserConfirm = (user) => {
    setUserToDelete(user);
    onDeleteAlertOpen();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/users/${userToDelete._id}`);
      
      toast({
        title: 'User deleted',
        description: `User ${userToDelete.name} has been deleted`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh user list
      fetchUsers(pagination.page, searchTerm);
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: error.response?.data?.message || 'Could not delete user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      onDeleteAlertClose();
      setUserToDelete(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!userForm.name || !userForm.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Additional validation for creating a user
    if (formMode === 'create' && !userForm.password) {
      toast({
        title: 'Password required',
        description: 'Please provide a password for the new user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      let response;
      
      if (formMode === 'create') {
        response = await axios.post('/api/users', userForm);
        toast({
          title: 'User created',
          description: `User ${response.data.name} has been created`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // For edit, only include password if it was changed
        const dataToUpdate = { ...userForm };
        if (!dataToUpdate.password) delete dataToUpdate.password;
        
        response = await axios.put(`/api/users/${currentUserId}`, dataToUpdate);
        toast({
          title: 'User updated',
          description: `User ${response.data.name} has been updated`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Close the modal and refresh the user list
      onUserModalClose();
      fetchUsers(pagination.page, searchTerm);
    } catch (error) {
      toast({
        title: `Error ${formMode === 'create' ? 'creating' : 'updating'} user`,
        description: error.response?.data?.message || `Could not ${formMode} user`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute requiredPermission="canManageUsers">
      <Container maxW="container.xl" py="8">
        <Box mb="8">
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="lg">User Management</Heading>
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
          </Flex>
          
          <Flex 
            as="form" 
            width="full" 
            mb="6" 
            onSubmit={handleSearch}
          >
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="filled"
              />
            </InputGroup>
            <Button
              ml="2"
              colorScheme="blue"
              type="submit"
              isLoading={loading}
            >
              Search
            </Button>
          </Flex>
          
          {users.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Department</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user._id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <Badge 
                          colorScheme={user.role === 'admin' ? 'red' : 
                                      user.role === 'manager' ? 'purple' : 
                                      user.role === 'technician' ? 'green' : 
                                      user.role === 'donor_coordinator' ? 'blue' : 'gray'}
                          py="1"
                          px="2"
                          borderRadius="full"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td>{user.department || '-'}</Td>
                      <Td>
                        <Badge 
                          colorScheme={user.status === 'active' ? 'green' : 
                                      user.status === 'inactive' ? 'red' : 'yellow'}
                          py="1"
                          px="2"
                          borderRadius="full"
                        >
                          {user.status}
                        </Badge>
                      </Td>
                      <Td>
                        <IconButton
                          icon={<EditIcon />}
                          aria-label="Edit user"
                          size="sm"
                          mr="2"
                          onClick={() => handleEditUser(user)}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Delete user"
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteUserConfirm(user)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              {/* Pagination */}
              <Flex justify="space-between" align="center" mt="4">
                <Text color="gray.600">
                  Showing {users.length} of {pagination.total} results
                </Text>
                <Stack direction="row" spacing="2">
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    isDisabled={pagination.page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    isDisabled={pagination.page >= pagination.pages || loading}
                  >
                    Next
                  </Button>
                </Stack>
              </Flex>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              {loading ? 'Loading users...' : 'No users found'}
            </Alert>
          )}
        </Box>
        
        {/* User Modal */}
        <UserModal 
          isOpen={isUserModalOpen}
          onClose={onUserModalClose}
          formMode={formMode}
          userForm={userForm}
          handleFormChange={handleFormChange}
          handleSubmit={handleSubmitUser}
          isLoading={loading}
        />
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation 
          isOpen={isDeleteAlertOpen}
          onClose={onDeleteAlertClose}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
          cancelRef={cancelRef}
          isLoading={loading}
        />
      </Container>
    </ProtectedRoute>
  );
};

export default UserManagementPage;
