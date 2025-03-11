import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Select,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, EditIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';

const DonorList = () => {
  const toast = useToast();
  const router = useRouter();
  const [donors, setDonors] = useState([]);
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

  const fetchDonors = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/api/donors?page=${page}&limit=${pagination.limit}`;
      
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
      
      setDonors(response.data.donors);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error fetching donors',
        description: error.response?.data?.message || 'Could not load donor data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors(pagination.page);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors(1); // Reset to first page when searching
  };

  const handleBloodTypeChange = (e) => {
    setBloodTypeFilter(e.target.value);
    fetchDonors(1); // Reset to first page when filter changes
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    fetchDonors(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    fetchDonors(newPage);
  };

  const handleViewDonor = (donorId) => {
    router.push(`/donors/${donorId}`);
  };

  const handleEditDonor = (donorId) => {
    router.push(`/donors/${donorId}/edit`);
  };

  const handleDeleteDonor = async (donorId, donorName) => {
    if (window.confirm(`Are you sure you want to delete donor ${donorName}?`)) {
      try {
        await axios.delete(`/api/donors/${donorId}`);
        
        toast({
          title: 'Donor deleted',
          description: `Donor ${donorName} has been deleted`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh the donor list
        fetchDonors(pagination.page);
      } catch (error) {
        toast({
          title: 'Error deleting donor',
          description: error.response?.data?.message || 'Could not delete donor',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'deferred': return 'orange';
      case 'ineligible': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };
