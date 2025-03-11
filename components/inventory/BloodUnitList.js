import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  Alert,
  AlertIcon,
  useToast,
  useDisclosure,
  Skeleton
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ChevronDownIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import axios from 'axios';

const BloodUnitList = () => {
  const toast = useToast();
  const router = useRouter();
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // Form and confirmation dialogs
  const cancelRef = useRef();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [unitToDelete, setUnitToDelete] = useState(null);
  
  // Fetch blood units
  const fetchBloodUnits = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/api/inventory/blood-units?page=${page}&limit=${pagination.limit}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (bloodTypeFilter) {
        url += `&bloodType=${encodeURIComponent(bloodTypeFilter)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url);
      
      setBloodUnits(response.data.bloodUnits);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load blood units',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize
  useEffect(() => {
    fetchBloodUnits(pagination.page);
  }, []);
  
  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBloodUnits(1); // Reset to first page when searching
  };
  
  const handleBloodTypeChange = (e) => {
    setBloodTypeFilter(e.target.value);
    fetchBloodUnits(1); // Reset to first page when filter changes
  };
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    fetchBloodUnits(1); // Reset to first page when filter changes
  };
  
  const handlePageChange = (newPage) => {
    fetchBloodUnits(newPage);
  };
  
  const handleViewBloodUnit = (unitId) => {
    router.push(`/inventory/blood-units/${unitId}`);
  };
  
  const handleAddBloodUnit = () => {
    router.push(`/inventory/blood-units/add`);
  };
  
  const handleEditBloodUnit = (unitId) => {
    router.push(`/inventory/blood-units/${unitId}/edit`);
  };
  
  const handleDeleteConfirm = (unit) => {
    setUnitToDelete(unit);
    onDeleteOpen();
  };
  
  const handleDeleteBloodUnit = async () => {
    if (!unitToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/inventory/blood-units/${unitToDelete._id}`);
      
      toast({
        title: 'Blood unit deleted',
        description: `Unit ${unitToDelete.unitId} has been deleted`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh blood unit list
      fetchBloodUnits(pagination.page);
      onDeleteClose();
      setUnitToDelete(null);
    } catch (error) {
      toast({
        title: 'Error deleting blood unit',
        description: error.response?.data?.message || 'Could not delete blood unit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Reserved': return 'blue';
      case 'Quarantined': return 'yellow';
      case 'Discarded': return 'gray';
      case 'Transfused': return 'purple';
      case 'Expired': return 'red';
      default: return 'gray';
    }
  };
