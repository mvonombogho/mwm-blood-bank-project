import { useState, useEffect } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  InputGroup,
  InputRightElement,
  useToast,
  Text,
  Stack,
  InputLeftElement,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { useRef } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);
  
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
